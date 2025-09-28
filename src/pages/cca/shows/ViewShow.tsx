import { Link, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import {
  useCloseSchedule,
  useCopySchedule,
  useDeleteSchedule,
  useGetShowSchedules,
  useOpenSchedule,
  useReschedule,
} from "@/_lib/@react-client-query/schedule.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import { useShowScheduleContext } from "@/context/ShowSchedulesContext.tsx";
import { useEffect, useState } from "react";
import type { Schedule } from "@/types/schedule.ts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Breadcrumbs from "@/components/BreadCrumbs";
import ShowCard from "@/components/ShowCard";
import Modal from "@/components/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DateSelector from "@/components/DateSelector";
import InputField from "@/components/InputField";
import { useAuthContext } from "@/context/AuthContext";
import PaginatedTable from "@/components/PaginatedTable";
import NotFound from "@/components/NotFound";
import AlertModal from "@/components/AlertModal";
import { toast } from "sonner";
import SalesReportDialog from "./SalesReportDialog";
import { useQueryClient } from "@tanstack/react-query";
import { CircleQuestionMarkIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import FixedPrice from "@/components/FixedPrice";
import SectionedPrice from "@/components/SectionedPrice";

const ViewShow = () => {
  const queryClient = useQueryClient();
  const closeSchedule = useCloseSchedule();
  const openSchedule = useOpenSchedule();
  const deleteSchedule = useDeleteSchedule();
  const reschedule = useReschedule();
  const duplicate = useCopySchedule();

  const { setSchedules } = useShowScheduleContext();
  const { id } = useParams();
  const { user } = useAuthContext();
  const { data: show, isLoading: isShowLoading } = useGetShow(id as string);
  const { data: showSchedules, isLoading: isSchedulesLoading } = useGetShowSchedules(id as string);

  const [isReschedule, setIsReschedule] = useState<Schedule | null>(null);
  const [copySchedule, setCopySchedule] = useState<Schedule | null>(null);
  const [newDate, setNewDate] = useState({ date: new Date(), time: "" });
  const [openSalesReport, setOpenSalesReport] = useState(false);

  useEffect(() => {
    if (!showSchedules) return;

    setSchedules(showSchedules);
  }, [showSchedules]);

  const handleCloseSchedule = (scheduleId: string) => {
    toast.promise(
      closeSchedule.mutateAsync(scheduleId).then(() => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((schedule) => (schedule.scheduleId === scheduleId ? { ...schedule, isOpen: false } : schedule));
        });
      }),
      {
        position: "top-center",
        loading: "Closing schedule...",
        success: "Schedule Closed ",
        error: (err: any) => err.message || "Failed to close schedule",
      }
    );
  };

  const handleOpenSchedule = (scheduleId: string) => {
    toast.promise(
      openSchedule.mutateAsync(scheduleId).then(() => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((schedule) => (schedule.scheduleId === scheduleId ? { ...schedule, isOpen: true } : schedule));
        });
      }),
      {
        position: "top-center",
        loading: "Opening schedule...",
        success: "Schedule is now Open ",
        error: (err: any) => err.message || "Failed to open schedule",
      }
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    toast.promise(
      deleteSchedule.mutateAsync(scheduleId).then(() => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((schedule) => schedule.scheduleId !== scheduleId);
        });
      }),
      {
        position: "top-center",
        loading: "Deleting schedule...",
        success: "Schedule deleted ",
        error: (err: any) => err.message || "Failed to delete schedule",
      }
    );
  };

  const handleReschedule = async () => {
    if (!isReschedule) return;

    if (!newDate.date || !newDate.time) {
      toast.error("Please provide new Date and Time", { position: "top-center" });
      return;
    }

    const oldDate = new Date(isReschedule.datetime);
    const [hours, minutes] = newDate.time.split(":").map(Number);
    const combinedNewDate = new Date(newDate.date);
    combinedNewDate.setHours(hours || 0, minutes || 0, 0, 0);

    if (oldDate.getTime() === combinedNewDate.getTime()) {
      toast.error("The new schedule date and time cannot be the same as the old one.", { position: "top-center" });
      return;
    }

    toast.promise(
      reschedule
        .mutateAsync({
          scheduleId: isReschedule.scheduleId,
          newDateTime: combinedNewDate,
        })
        .then(() => {
          queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
            if (!oldData) return oldData;
            return oldData.map((schedule) =>
              schedule.scheduleId === isReschedule.scheduleId ? { ...schedule, datetime: combinedNewDate } : schedule
            );
          });
          setIsReschedule(null);
          setNewDate({ date: new Date(), time: "" });
        }),
      {
        position: "top-center",
        loading: "Updating schedule...",
        success: "Schedule updated successfully",
        error: (err: any) => err.message || "Failed to update schedule",
      }
    );
  };

  const handleDuplicateSchedule = () => {
    if (!copySchedule) return;

    if (!newDate.date || !newDate.time) {
      toast.error("Please provide new Date and Time", { position: "top-center" });
      return;
    }

    const combinedNewDate = new Date(newDate.date);
    const [hours, minutes] = newDate.time.split(":").map(Number);
    combinedNewDate.setHours(hours || 0, minutes || 0, 0, 0);

    toast.promise(
      duplicate
        .mutateAsync({
          scheduleId: copySchedule.scheduleId,
          newDateTime: combinedNewDate,
        })
        .then((schedule) => {
          console.log(schedule);

          queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
            if (!oldData) return oldData;
            return [schedule, ...oldData];
          });
          setCopySchedule(null);
          setNewDate({ date: new Date(), time: "" });
        }),
      {
        position: "top-center",
        loading: "Copying schedule...",
        success: "Schedule copied successfully",
        error: (err: any) => err.message || "Failed to copy schedule",
      }
    );
  };

  if (isShowLoading || isSchedulesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ContentWrapper>
      <Breadcrumbs
        backHref={show?.showType == "majorProduction" ? "/majorShows" : "/shows"}
        items={[{ name: "Show", href: show?.showType == "majorProduction" ? "/majorShows" : "/shows" }, { name: show?.title ?? "Show Not Found." }]}
      />

      <div className="mt-10">
        <div className="flex gap-5 flex-col sm:flex-row ">
          {show && (
            <ShowCard
              className="w-full max-w-2xl"
              title={show.title}
              description={show.description}
              genres={show.genreNames}
              showImage={show.showCover}
            />
          )}
          {/* {showSchedules && (
            <Card>
              <CardHeader>
                <CardTitle>Calender Schedules</CardTitle>
                <CardDescription></CardDescription>
                <CardContent className="p-0 ">
                  <Calendar
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    selected={undefined}
                    className="mt-2 rounded-md border bg-background 
                     [--cell-size:2.75rem] [--cell-font-size:0.95rem] md:[--cell-size:3.25rem] md:[--cell-font-size:1rem]"
                    modifiers={{
                      highlighted: showSchedules.map((d) => new Date(d.datetime)),
                    }}
                    modifiersClassNames={{
                      highlighted: "bg-primary text-primary-foreground font-medium rounded-md ",
                    }}
                  />
                </CardContent>
              </CardHeader>
            </Card>
          )} */}
        </div>
        {show && showSchedules && (
          <div className="mt-10">
            <div className="flex justify-between mb-10">
              <div className="flex flex-col gap-5">
                <h1 className="font-semibold text-2xl ">Show Schedules</h1>
              </div>
              <div className="flex gap-2">
                <SalesReportDialog
                  showSchedules={showSchedules}
                  openSalesReport={openSalesReport}
                  setOpenSalesReport={setOpenSalesReport}
                  onGenerateReport={(scheduleIds, options) => {
                    const scheduleIdsParam = scheduleIds.join(",");
                    const url = `/salesreport/${id}/${scheduleIdsParam}?distributors=${options.includeDistributor}`;
                    window.open(url, "_blank");
                  }}
                />
                {((show.showType === "majorProduction" && user?.roles.includes("head")) ||
                  (show.showType !== "majorProduction" && (user?.roles.includes("head") || user?.roles.includes("trainer")))) && (
                  <Link className="self-end" to={`/shows/add/schedule/${id}`}>
                    <Button>Add New Schedule</Button>
                  </Link>
                )}
              </div>
            </div>

            <PaginatedTable
              emptyMessage="No Schedules"
              data={showSchedules}
              columns={[
                {
                  key: "date",
                  header: "Date",
                  render: (schedule) => formatToReadableDate(schedule.datetime + ""),
                },
                {
                  key: "time",
                  header: "Time",
                  render: (schedule) => formatToReadableTime(schedule.datetime + ""),
                },
                {
                  key: "seating",
                  header: "Seating Type",
                  render: (schedule) => schedule.seatingType.toUpperCase(),
                },
                {
                  key: "pricing",
                  header: "Ticket Price",
                  render: (schedule) => (
                    <span className="flex items-center gap-1">
                      {schedule.ticketPricing ? schedule.ticketPricing.type.toUpperCase() : "Free"}
                      <HoverCard closeDelay={100} openDelay={50}>
                        <HoverCardTrigger>
                          <CircleQuestionMarkIcon className="w-4 cursor-pointer text-muted-foreground" />
                        </HoverCardTrigger>
                        <HoverCardContent className="p-0">
                          {schedule.ticketPricing && schedule.ticketPricing.type == "fixed" && (
                            <FixedPrice data={schedule.ticketPricing} hideAction={true} />
                          )}
                          {schedule.ticketPricing && schedule.ticketPricing.type == "sectioned" && (
                            <SectionedPrice data={schedule.ticketPricing} hideAction={true} />
                          )}
                          {!schedule.ticketPricing && <p className="p-5">Schedule is non-ticketed schedule</p>}
                        </HoverCardContent>
                      </HoverCard>
                    </span>
                  ),
                },
                {
                  key: "ticket",
                  header: "Ticket Type",
                  render: (schedule) => schedule.ticketType.toUpperCase(),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (schedule) =>
                    schedule.isOpen ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-green w-2 h-2 rounded-full"></span>
                        <p>Open</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="bg-red w-2 h-2 rounded-full"></span>
                        <p>Close</p>
                      </div>
                    ),
                },
                {
                  key: "action",
                  header: "Actions",
                  headerClassName: "text-right",
                  render: (schedule) => (
                    <div className="flex gap-2 justify-end items-center ">
                      <div className="relative group">
                        <Link to={`/shows/schedule/${id}/${schedule.scheduleId}/`}>
                          <Button>Go To Schedule</Button>
                        </Link>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline">
                            <Settings2Icon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Select Options</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => setIsReschedule(schedule)}>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCopySchedule(schedule)}>Duplicate Schedule</DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <AlertModal
                                confirmation={schedule.isOpen ? "Close" : "Open"}
                                actionText="Confirm"
                                onConfirm={() =>
                                  schedule.isOpen ? handleCloseSchedule(schedule.scheduleId) : handleOpenSchedule(schedule.scheduleId)
                                }
                                title={schedule.isOpen ? "Close Schedule" : "Open Schedule"}
                                description={schedule.isOpen ? "This action will close this schedule." : "This action will open this schedule."}
                                trigger={<p>{schedule.isOpen ? "Close Schedule" : "Open Schedule"}</p>}
                              />
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertModal
                        confirmation="Delete"
                        actionText="Confirm"
                        onConfirm={() => handleDeleteSchedule(schedule.scheduleId)}
                        title="Delete Schedule"
                        trigger={
                          <Button variant="destructive">
                            <Trash2Icon />
                          </Button>
                        }
                      >
                        <div className="-mt-2 space-y-2 text-center">
                          <p className="text-sm text-muted-foreground">Are you sure you want to delete this schedule?</p>
                          <p className="text-sm font-medium">
                            {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
                          </p>
                        </div>
                      </AlertModal>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {(!show || !showSchedules) && <NotFound title="Show not found." description="The show does not exist or the show have been deleted." />}
      </div>

      {isReschedule && (
        <Modal
          description="All data related to this schedule will be transfered"
          title="Reschedule"
          isOpen={!!isReschedule}
          onClose={() => setIsReschedule(null)}
        >
          <Card className="rounded-md">
            <CardHeader className="p-4">
              <CardTitle>Current Schedule Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex gap-5 -mt-5">
              <p>{formatToReadableDate(isReschedule.datetime + "")}</p>
              <p>{formatToReadableTime(isReschedule.datetime + "")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-md mt-5">
            <CardHeader className="p-4">
              <CardTitle>Input New Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              <DateSelector
                date={newDate.date}
                disabled={reschedule.isPending}
                initialValue={newDate.date}
                handleDateSelect={(date) => setNewDate((prev) => ({ ...prev, date }))}
              />
              <InputField
                label="Time"
                type="time"
                step={60}
                value={newDate.time?.slice(0, 5)}
                onChange={(e) => setNewDate((prev) => ({ ...prev, time: e.target.value }))}
                className="bg-background appearance-none"
              />
            </CardContent>
          </Card>

          <div className="flex mt-5 justify-end gap-3">
            <Button variant="outline" disabled={reschedule.isPending} onClick={() => setIsReschedule(null)}>
              Cancel
            </Button>
            <Button disabled={reschedule.isPending} onClick={handleReschedule}>
              Reschedule
            </Button>
          </div>
        </Modal>
      )}

      {copySchedule && (
        <Modal
          title="Duplicate Schedule"
          description="This will create a copy of the selected schedule. You can set a new date and time for the duplicated schedule."
          isOpen={!!copySchedule}
          onClose={() => setCopySchedule(null)}
        >
          <Card>
            <CardContent className="p-4 flex flex-col gap-3">
              <DateSelector
                disabled={duplicate.isPending}
                date={newDate.date}
                handleDateSelect={(date) => setNewDate((prev) => ({ ...prev, date }))}
              />
              <InputField
                disabled={duplicate.isPending}
                label="Time"
                type="time"
                step={60}
                value={newDate.time?.slice(0, 5)}
                onChange={(e) => setNewDate((prev) => ({ ...prev, time: e.target.value }))}
                className="bg-background appearance-none"
              />
            </CardContent>
          </Card>

          <div className="flex mt-5 justify-end gap-3">
            <Button variant="outline" disabled={duplicate.isPending} onClick={() => setCopySchedule(null)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicateSchedule} disabled={duplicate.isPending}>
              Duplicate
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default ViewShow;

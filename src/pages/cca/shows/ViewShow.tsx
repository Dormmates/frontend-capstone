import { Link, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import {
  useCheckCloseSchedule,
  useCloseSchedule,
  useCopySchedule,
  useDeleteSchedule,
  useGetShowSchedules,
  useReschedule,
} from "@/_lib/@react-client-query/schedule.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
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
import { CheckIcon, CircleAlertIcon, CircleQuestionMarkIcon, Settings2Icon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import FixedPrice from "@/components/FixedPrice";
import SectionedPrice from "@/components/SectionedPrice";
import DialogPopup from "@/components/DialogPopup";
import { formatCurrency } from "@/utils";
import { compressControlNumbers } from "@/utils/controlNumber";
import { distributorTypeOptions } from "@/types/user";
import Loading from "@/components/Loading";

const ViewShow = () => {
  const queryClient = useQueryClient();
  const deleteSchedule = useDeleteSchedule();
  const reschedule = useReschedule();
  const duplicate = useCopySchedule();

  const { id } = useParams();
  const { user } = useAuthContext();
  const { data: show, isLoading: isShowLoading } = useGetShow(id as string);
  const { data: showSchedules, isLoading: isSchedulesLoading } = useGetShowSchedules(id as string);

  const [isReschedule, setIsReschedule] = useState<Schedule | null>(null);
  const [copySchedule, setCopySchedule] = useState<Schedule | null>(null);
  const [newDate, setNewDate] = useState({ date: new Date(), time: "" });
  const [openSalesReport, setOpenSalesReport] = useState(false);

  useEffect(() => {
    document.title = `${show?.title}`;
  }, [show]);

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
    return <Loading />;
  }

  return (
    <ContentWrapper>
      <Breadcrumbs items={[{ name: "Show", href: "#" }, { name: show?.title ?? "Show Not Found." }]} />

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
        </div>

        {show && show.isArchived && (
          <div className="flex  flex-col bg-muted border shadow-sm border-l-red border-l-4 rounded-md w-full p-3 gap-1 mt-5">
            <div className="flex items-center gap-2">
              <CircleAlertIcon className="text-red w-4 font-bold" />
              <p className="font-medium text-sm">Note - This Show is currently Archived</p>
            </div>
            <p className="text-sm text-muted-foreground ">
              Actions such as ticket allocation, remittance, and related tasks are restricted until the show is unarchived.
            </p>
          </div>
        )}
        {show && showSchedules && (
          <div className="mt-10">
            <div className="flex flex-col gap-4 md:flex-row justify-between mb-10">
              <div className="flex flex-col gap-5">
                <h1 className="font-semibold text-2xl ">Show Schedules</h1>
              </div>
              <div className="flex gap-2">
                {(user?.roles.includes("head") || show.showType !== "majorProduction") && (
                  <>
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
                    <Button disabled={show.isArchived}>
                      <Link className="self-end" to={`/shows/add/schedule/${id}`}>
                        Add New Schedule
                      </Link>
                    </Button>
                  </>
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
                      <Link to={`/shows/schedule/${id}/${schedule.scheduleId}/`}>
                        <Button>{user?.roles.includes("head") || show.showType !== "majorProduction" ? "Manage Schedule" : "View Schedule"}</Button>
                      </Link>

                      {(user?.roles.includes("head") || show.showType !== "majorProduction") && (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger disabled={show.isArchived}>
                              <Button size="icon" disabled={show.isArchived} variant="outline">
                                <Settings2Icon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Select Options</DropdownMenuLabel>
                              <DropdownMenuGroup>
                                {schedule.isOpen && <DropdownMenuItem onClick={() => setIsReschedule(schedule)}>Reschedule</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => setCopySchedule(schedule)}>Copy Schedule</DropdownMenuItem>
                                {user?.roles.includes("head") && schedule.isOpen && (
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <DialogPopup
                                      className="max-w-5xl"
                                      description={schedule.isOpen ? "This action will close this schedule." : "This action will open this schedule."}
                                      title={schedule.isOpen ? "Close Schedule" : "Open Schedule"}
                                      triggerElement={<p>{schedule.isOpen ? "Close Schedule" : "Open Schedule"}</p>}
                                    >
                                      <CloseSchedule scheduleId={schedule.scheduleId} />
                                    </DialogPopup>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertModal
                            confirmation="Delete"
                            actionText="Confirm"
                            onConfirm={() => handleDeleteSchedule(schedule.scheduleId)}
                            title="Delete Schedule"
                            trigger={
                              <Button size="icon" disabled={show.isArchived} variant="destructive">
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
                        </>
                      )}
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
          title="Copy Schedule"
          description="This will create a copy of all the  details of the selected schedule. You can set a new date and time for the copied schedule."
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
              Copy
            </Button>
          </div>
        </Modal>
      )}
    </ContentWrapper>
  );
};

type CloseScheduleProps = {
  scheduleId: string;
};

const CloseSchedule = ({ scheduleId }: CloseScheduleProps) => {
  const { data, isLoading, isError } = useCheckCloseSchedule(scheduleId);
  const closeSchedule = useCloseSchedule();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <h1>Loadingg....</h1>;
  }

  if (isError || !data) {
    return <h1>Erorr</h1>;
  }

  const handleCloseSchedule = () => {
    toast.promise(closeSchedule.mutateAsync(scheduleId)),
      {
        position: "top-center",
        loading: "Closing schedule...",
        success: () => {
          queryClient.setQueryData<Schedule[]>(["schedules", scheduleId], (oldData) => {
            if (!oldData) return oldData;
            return oldData.map((schedule) => (schedule.scheduleId === scheduleId ? { ...schedule, isOpen: false } : schedule));
          });
          return "Schedule Closed ";
        },
        error: (err: any) => err.message || "Failed to close schedule",
      };
  };

  return (
    <div>
      <div className={`border-2 rounded-md p-4 ${data.canBeClosed ? "bg-green/10 border-green" : "bg-red/20 border-red"}`}>
        <div className="flex items-start gap-3">
          {data.canBeClosed ? (
            <CheckIcon className="w-6 h-6 mt-1 flex-shrink-0 text-green" />
          ) : (
            <TriangleAlertIcon className="w-6 h-6 mt-1 flex-shrink-0 text-red" />
          )}

          <div className="flex flex-col gap-1">
            <p className={`font-bold ${data.canBeClosed ? "text-green" : "text-red"}`}>
              {data.canBeClosed ? "Schedule can be closed." : "Schedule cannot be closed."}
            </p>
            <p className={`text-sm font-medium leading-snug ${data.canBeClosed ? "text-green" : "text-red"}`}>
              {data.canBeClosed
                ? "All distributors have settled their balances. You may now close this schedule."
                : "Some distributors still have unpaid balances. Please review and settle before closing."}
            </p>
          </div>
        </div>
      </div>

      <div className="my-5">
        <p className="font-bold">Summary</p>
        <div>
          <p>Total Distributors: {data.summary.totalDistributors}</p>
          <p>Total Unpaid: {formatCurrency(data.summary.totalUnpaid)}</p>
          <p>Distributors with Balance Due: {data.summary.withBalanceDue}</p>
          <p>
            Unsold/Unallocated tickets: {data.summary.notAllocatedTickets.length} (
            {compressControlNumbers(data.summary.notAllocatedTickets.map((t) => t.controlNumber))})
          </p>
        </div>
      </div>

      {data.withBalanceDue.length > 0 && (
        <div>
          <PaginatedTable
            columns={[
              {
                key: "name",
                header: "Distributor Name",
                render: (dist) => dist.name,
              },
              {
                key: "department",
                header: "Type",
                render: (dist) => distributorTypeOptions.find((t) => t.value === dist.distributorType)?.name,
              },
              {
                key: "total",
                header: "Total Tickets",
                render: (dist) => dist.totalTickets,
              },
              {
                key: "paid",
                header: "Total Paid",
                render: (dist) => formatCurrency(dist.totalPaid),
              },
              {
                key: "unpaid",
                header: "Balance Due",
                render: (dist) => formatCurrency(dist.unpaidAmount),
              },
              {
                key: "unpaidTickets",
                header: "Unpaid Tickets",
                render: (dist) => compressControlNumbers(dist.tickets.filter((t) => t.status !== "paidToCCA").map((t) => t.controlNumber)),
              },
            ]}
            data={data.withBalanceDue}
          />
        </div>
      )}

      {data.canBeClosed && (
        <>
          <div className="mt-4 border border-yellow bg-yellow/20 rounded-md p-4">
            <div className="flex flex-col gap-2">
              <p className="text-yellow-800 font-bold text-sm">Important Reminder</p>
              <p className="text-yellow-700 text-sm">
                Once you close this schedule, all actions related to its tickets; including
                <span className="font-semibold">refunds, reallocations, and further edits</span> will be permanently disabled.
              </p>
              <p className="text-yellow-700 text-sm">
                Please ensure that all sales have been properly <span className="font-semibold">remitted or turned over to the finance office</span>{" "}
                before proceeding.
              </p>
              <p className="text-yellow-700 text-sm font-semibold">
                This schedule <span className="text-red-700">cannot be reopened</span> once it has been closed.
              </p>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button onClick={handleCloseSchedule}>Close Schedule</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewShow;

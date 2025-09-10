import { Link, useParams } from "react-router-dom";
import { useGetShow } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useCloseSchedule, useDeleteSchedule, useGetShowSchedules, useOpenSchedule, useReschedule } from "@/_lib/@react-client-query/schedule.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import deleteIcon from "../../../assets/icons/delete.png";
import { useShowScheduleContext } from "@/context/ShowSchedulesContext.tsx";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ToastNotification from "../../../utils/toastNotification";
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

const ViewShow = () => {
  const queryClient = useQueryClient();
  const closeSchedule = useCloseSchedule();
  const openSchedule = useOpenSchedule();
  const deleteSchedule = useDeleteSchedule();
  const reschedule = useReschedule();

  const { setSchedules } = useShowScheduleContext();
  const { id } = useParams();
  const { user } = useAuthContext();
  const { data: show, isLoading: isShowLoading } = useGetShow(id as string);
  const { data: showSchedules, isLoading: isSchedulesLoading } = useGetShowSchedules(id as string);

  const [isReschedule, setIsReschedule] = useState<Schedule | null>(null);
  const [newDate, setNewDate] = useState({ date: new Date(), time: "" });

  useEffect(() => {
    if (!showSchedules) return;

    setSchedules(showSchedules);
  }, [showSchedules]);

  const handleCloseSchedule = (scheduleId: string) => {
    closeSchedule.mutate(scheduleId, {
      onSuccess: () => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((schedule) => (schedule.scheduleId === scheduleId ? { ...schedule, isOpen: false } : schedule));
        });
        ToastNotification.success("Schedule Closed");
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  const handleOpenSchedule = (scheduleId: string) => {
    openSchedule.mutate(scheduleId, {
      onSuccess: () => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((schedule) => (schedule.scheduleId === scheduleId ? { ...schedule, isOpen: true } : schedule));
        });
        ToastNotification.success("Schedule is now Open");
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule.mutate(scheduleId, {
      onSuccess: () => {
        queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((schedule) => schedule.scheduleId !== scheduleId);
        });
        ToastNotification.success("Schedule is deleted");
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

  const handleReschedule = () => {
    if (!isReschedule) return;

    if (!newDate.date || !newDate.time) {
      ToastNotification.error("Please provide new Date and Time");
      return;
    }

    const oldDate = new Date(isReschedule.datetime);
    const [hours, minutes] = newDate.time.split(":").map(Number);
    const combinedNewDate = new Date(newDate.date);
    combinedNewDate.setHours(hours || 0, minutes || 0, 0, 0);

    if (oldDate.getTime() === combinedNewDate.getTime()) {
      ToastNotification.error("The new schedule date and time cannot be the same as the old one.");
      return;
    }

    reschedule.mutate(
      {
        scheduleId: isReschedule.scheduleId,
        newDateTime: combinedNewDate,
      },
      {
        onSuccess: () => {
          queryClient.setQueryData<Schedule[]>(["schedules", id], (oldData) => {
            if (!oldData) return oldData;
            return oldData.map((schedule) =>
              schedule.scheduleId === isReschedule.scheduleId ? { ...schedule, datetime: combinedNewDate } : schedule
            );
          });
          ToastNotification.success("Schedule updated successfully");
          setIsReschedule(null);
          setNewDate({ date: new Date(), time: "" });
        },
        onError: (err) => {
          ToastNotification.error(err.message);
        },
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

      <div>
        {show && <ShowCard title={show.title} description={show.description} genres={show.genreNames} showImage={show.showCover} className="mt-10" />}

        {show && showSchedules && (
          <div className="mt-10">
            <div className="flex justify-between mb-10">
              <div className="flex flex-col gap-5">
                <h1 className="font-semibold text-2xl ">Show Schedules</h1>
              </div>
              {((show.showType === "majorProduction" && user?.roles.includes("head")) ||
                (show.showType !== "majorProduction" && (user?.roles.includes("head") || user?.roles.includes("trainer")))) && (
                <Link className="self-end" to={`/shows/add/schedule/${id}`}>
                  <Button>Add New Schedule</Button>
                </Link>
              )}
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
                          <Button disabled={!schedule.isOpen}>Go To Schedule</Button>
                        </Link>

                        {!schedule.isOpen && (
                          <div className="absolute  -left-28 top-0 hidden group-hover:flex  text-nowrap p-2 bg-zinc-700 text-white text-xs rounded shadow z-10 pointer-events-none">
                            Schedule is Closed
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline">Options</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Select Options</DropdownMenuLabel>
                          <DropdownMenuGroup>
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
                            <DropdownMenuItem onClick={() => setIsReschedule(schedule)}>Reschedule</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertModal
                        tooltip={!schedule.isOpen ? "Delete" : "Cannot Delete Open Schedule"}
                        confirmation="Delete"
                        actionText="Confirm"
                        onConfirm={() => handleDeleteSchedule(schedule.scheduleId)}
                        title="Delete Schedule"
                        trigger={
                          <Button variant="ghost" size="icon" disabled={schedule.isOpen}>
                            <img src={deleteIcon} alt="delete" />
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
    </ContentWrapper>
  );
};

export default ViewShow;

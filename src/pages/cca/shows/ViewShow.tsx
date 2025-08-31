import { Link, useParams } from "react-router-dom";
import { useGetShow } from "../../../_lib/@react-client-query/show";
import { ContentWrapper } from "../../../components/layout/Wrapper";

import { useCloseSchedule, useDeleteSchedule, useGetShowSchedules, useOpenSchedule, useReschedule } from "../../../_lib/@react-client-query/schedule";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";

import deleteIcon from "../../../assets/icons/delete.png";
import { useShowScheduleContext } from "../../../context/ShowSchedulesContext";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ToastNotification from "../../../utils/toastNotification";
import type { Schedule } from "../../../types/schedule";

import DateInput from "../../../components/ui/DateInput";
import TimeInput from "../../../components/ui/TimeInput";
import down_arrow from "../../../assets/icons/down_arrow.png";
import { Dialog } from "@radix-ui/react-dialog";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Breadcrumbs from "@/components/BreadCrumbs";
import ShowCard from "@/components/ShowCard";

const ViewShow = () => {
  const queryClient = useQueryClient();
  const closeSchedule = useCloseSchedule();
  const openSchedule = useOpenSchedule();
  const deleteSchedule = useDeleteSchedule();
  const reschedule = useReschedule();

  const { setSchedules } = useShowScheduleContext();
  const { id } = useParams();
  const { data: show, isLoading: isShowLoading, isError: isShowError, error: showError } = useGetShow(id as string);
  const { data: showSchedules, isLoading: isSchedulesLoading, isError: isSchedulesError, error: schedulesError } = useGetShowSchedules(id as string);

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

  if (isShowError || isSchedulesError || !showSchedules || !show) {
    return (
      <div className="text-red-500">
        {isShowError && <p>Failed to load show: {showError?.message}</p>}
        {isSchedulesError && <p>Failed to load schedules: {schedulesError?.message}</p>}
      </div>
    );
  }

  return (
    <ContentWrapper className="lg:!p-20 flex flex-col">
      <Breadcrumbs backHref="/shows" items={[{ name: "Show", href: "/shows" }, { name: show.title }]} />

      <div>
        <ShowCard title={show.title} description={show.description} genres={show.genreNames} showImage={show.showCover} className="mt-10" />

        <div className="mt-10">
          <div className="flex justify-between">
            <div className="flex flex-col gap-5">
              <h1 className="font-semibold text-2xl ">Show Schedules</h1>
            </div>
            <Link className="self-end" to={`/shows/add/schedule/${id}`}>
              <Button>Add New Schedule</Button>
            </Link>
          </div>

          <div className="mt-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Seating Type</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Schedule Status</TableHead>

                  <TableHead className="text-center pl-60">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {showSchedules.length == 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      No Schedules
                    </TableCell>
                  </TableRow>
                ) : (
                  showSchedules.map((schedule) => (
                    <TableRow key={schedule.scheduleId}>
                      <TableCell>{formatToReadableDate(schedule.datetime + "")}</TableCell>
                      <TableCell>{formatToReadableTime(schedule.datetime + "")}</TableCell>
                      <TableCell>{schedule.seatingType.toUpperCase()}</TableCell>
                      <TableCell>{schedule.ticketType.toUpperCase()}</TableCell>
                      <TableCell>
                        {schedule.isOpen ? (
                          <div className="flex items-center gap-2">
                            <div className="bg-green w-3 h-3 rounded-full"></div>
                            <p>Open</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="bg-red w-3 h-3 rounded-full"></div>
                            <p>Closed</p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
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
                                <DropdownMenuItem
                                  onClick={() =>
                                    schedule.isOpen ? handleCloseSchedule(schedule.scheduleId) : handleOpenSchedule(schedule.scheduleId)
                                  }
                                >
                                  {schedule.isOpen ? "Close Schedule" : "Open Schedule"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReschedule()}>Reschedule</DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Tooltip>
                            <TooltipTrigger>
                              <Button variant="ghost" onClick={() => handleDeleteSchedule(schedule.scheduleId)} disabled={schedule.isOpen}>
                                <img src={deleteIcon} alt="delete" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{!schedule.isOpen ? "Delete" : "Cannot Delete Open Schedule"}</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isReschedule && (
        <Dialog open={!!isReschedule} onOpenChange={() => setIsReschedule(null)}>
          <div className="border border-lightGrey rounded-md p-5 flex flex-col gap-5 mt-10">
            <h1 className="-mb-2 text-xl">Schedule Details</h1>

            <div className="flex justify-between gap-10">
              <DateInput label="Old Date" disabled={true} value={new Date(isReschedule.datetime)} onChange={() => {}} />
              <TimeInput
                label="Old Time"
                disabled
                value={
                  isReschedule?.datetime
                    ? new Date(isReschedule.datetime).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : undefined
                }
                onChange={() => {}}
              />
            </div>

            <div className="w-full flex  justify-center">
              <img src={down_arrow} alt="down arrow" />
            </div>

            <div className="flex justify-between gap-10">
              <DateInput
                disabled={reschedule.isPending}
                label="New Date"
                value={newDate.date}
                onChange={(date) => setNewDate((prev) => ({ ...prev, date }))}
              />
              <TimeInput
                disabled={reschedule.isPending}
                label="New Time"
                value={newDate.time}
                onChange={(time) => setNewDate((prev) => ({ ...prev, time }))}
              />
            </div>
          </div>
          <div className="flex mt-5 justify-end gap-3">
            <Button disabled={reschedule.isPending} className="!bg-green" onClick={handleReschedule}>
              Reschedule
            </Button>
            <Button disabled={reschedule.isPending} className="!bg-red" onClick={() => setIsReschedule(null)}>
              Cancel
            </Button>
          </div>
        </Dialog>
      )}
    </ContentWrapper>
  );
};

export default ViewShow;

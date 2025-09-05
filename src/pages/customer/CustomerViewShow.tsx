import { useState } from "react";
import { useGetShow } from "@/_lib/@react-client-query/show";
import { useGetShowSchedules } from "@/_lib/@react-client-query/schedule";
import Breadcrumbs from "@/components/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import type { Schedule } from "@/types/schedule";

const CustomerViewShow = () => {
  const { showId, scheduleId } = useParams();
  const navigate = useNavigate();

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const { data: show, isLoading: loadingShow, isError: errorShow } = useGetShow(showId as string);
  const {
    data: schedules,
    isLoading: loadingSchedules,
    isError: errorSchedules,
  } = useGetShowSchedules(showId as string, {
    excludeClosed: true,
    excludeReservationOff: true,
  });

  if (loadingShow || loadingSchedules) {
    return <h1>Loading...</h1>;
  }

  if (!show || !schedules || errorShow || errorSchedules) {
    return <h1>Error loading show or schedules</h1>;
  }

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const dateKey = new Date(schedule.datetime).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    navigate(`/customer/show/${showId}/schedule/${schedule.scheduleId}`);
  };

  return (
    <>
      <Breadcrumbs backHref="/customer" items={[{ name: "Return to Shows List", href: "/customer" }]} />

      {/* Show Details */}
      <div className="flex flex-col gap-5 mt-10 md:flex-row">
        <div className="max-w-[200px] h-[250px] bg-lightGrey">
          <img className="w-full h-full object-cover" src={show.showCover} alt="img" />
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-lg">{show.title}</div>
          <div className="flex flex-wrap gap-2">
            {show.genreNames.map((name, index) => (
              <Badge key={index} variant="outline" className="rounded-full">
                {name}
              </Badge>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-h-fit overflow-y-auto pr-1 md:max-w-[550px]">{show.description}</p>
        </div>
      </div>

      {/* Show Schedules */}
      {!scheduleId ? (
        <div className="flex flex-col gap-5 mt-10">
          <Label>Select Show Schedule</Label>

          {Object.entries(groupedSchedules).map(([date, schedules]) => (
            <div key={date} className="flex flex-col gap-3 rounded-md p-5 shadow-md">
              <h1 className="text-xl font-medium">{formatToReadableDate(schedules[0].datetime + "")}</h1>
              <div className="flex gap-2 mt-5">
                {schedules.map((schedule) => (
                  <Button key={schedule.scheduleId} className="w-fit p-10 text-lg" variant="outline" onClick={() => handleScheduleClick(schedule)}>
                    {formatToReadableTime(schedule.datetime + "")}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {schedules.length === 0 && <div className="text-muted-foreground text-center w-full text-lg">No Available Show Schedule.</div>}
        </div>
      ) : (
        <Outlet context={{ schedule: selectedSchedule }} />
      )}
    </>
  );
};

export default CustomerViewShow;

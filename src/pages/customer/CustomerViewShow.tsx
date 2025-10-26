import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
// import { useParams, useNavigate } from "react-router-dom";
// import type { Schedule } from "@/types/schedule";

import type { ShowDataWithSchedules } from "@/types/show";
import Countdown from "@/components/Countdown";
import { formatSectionName } from "@/utils/seatmap";
import { formatCurrency, getSectionedPriceRange } from "@/utils";
import type { SectionedPricing } from "@/types/ticketpricing";

type CustomerViewShowProps = {
  show: ShowDataWithSchedules;
};

const CustomerViewShow = ({ show }: CustomerViewShowProps) => {
  // const { showId } = useParams();
  // const navigate = useNavigate();

  // const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    document.title = `${show?.title}`;
  }, [show]);

  const groupedRemainingSchedules = show.remainingUpcomingSchedules.reduce((acc, schedule) => {
    const dateKey = new Date(schedule.datetime).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, typeof show.remainingUpcomingSchedules>);

  const groupedPastSchedules = show.pastSchedules.reduce((acc, schedule) => {
    const dateKey = new Date(schedule.datetime).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, typeof show.remainingUpcomingSchedules>);

  // const handleScheduleClick = (schedule: Schedule) => {
  //   setSelectedSchedule(schedule);
  //   navigate(`/show/${showId}/schedule/${schedule.scheduleId}`);
  // };

  return (
    <>
      <div className="relative flex flex-col gap-5  md:flex-row rounded-xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-cover bg-center blur-md scale-110" style={{ backgroundImage: `url(${show.showCover})` }}></div>

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex flex-col md:flex-row gap-5 p-6">
          <div className="max-w-[250px] h-[350px] flex-shrink-0">
            <img className="w-full h-full object-cover rounded-lg shadow-lg" src={show.showCover} alt="img" />
          </div>

          <div className="flex flex-col text-white">
            <div className="font-bold text-2xl ">{show.title}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {show.genreNames.map((name, index) => (
                <Badge key={index} variant="secondary" className="rounded-full bg-white/20 backdrop-blur-sm text-white border-none">
                  {name}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-gray-200 text-sm leading-relaxed max-h-fit overflow-y-auto pr-1 md:max-w-[550px]">{show.description}</p>
          </div>
        </div>
      </div>

      {show.remainingUpcomingSchedules.length === 0 && show.pastSchedules.length === 0 && !show.nextSchedule && (
        <div className="w-full h-[200px] flex items-center justify-center border rounded-sm shadow-sm font-semibold mt-10">
          No Available Schedules
        </div>
      )}

      {show.nextSchedule && (
        <div className="mt-10 border p-4 rounded-md shadow-md">
          <h1 className="text-md text-muted-foreground ">Earliest Show Start</h1>
          <div className="gap-10 flex-col md:flex-row flex w-full justify-between  mt-2">
            <div>
              <h1 className="text-2xl font-bold">
                {formatToReadableDate(show.nextSchedule.datetime + "")} at {formatToReadableTime(show.nextSchedule.datetime + "")}
              </h1>
              <p className="text-xl">
                Starts in: <Countdown showDate={show.nextSchedule.datetime} />
              </p>
            </div>
            <div>
              <p className="text-xl">{formatSectionName(show.nextSchedule.seatingType)}</p>
              <p className="text-xl">
                {show.nextSchedule.ticketPricing.type === "fixed"
                  ? formatCurrency(show.nextSchedule.ticketPricing.fixedPrice)
                  : getSectionedPriceRange(show.nextSchedule.ticketPricing as SectionedPricing).rangeText}
              </p>
            </div>
          </div>
        </div>
      )}

      {show.remainingUpcomingSchedules.length !== 0 && (
        <div className="flex flex-col gap-5 mt-10">
          <Label>Upcoming Show Schedules</Label>

          {Object.entries(groupedRemainingSchedules).map(([date, schedules]) => (
            <div key={date} className="flex flex-col gap-3 rounded-md p-5 shadow-md">
              <h1 className="text-xl font-medium">{formatToReadableDate(schedules[0].datetime + "")}</h1>
              <div className="flex gap-2 mt-5">
                {schedules.map((schedule) => (
                  <Button key={schedule.scheduleId} className="w-fit p-10 text-lg" variant="outline" onClick={() => {}}>
                    {formatToReadableTime(schedule.datetime + "")}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {show.pastSchedules.length !== 0 && (
        <div className="flex flex-col gap-5 mt-10">
          <Label>Past Show Schedules</Label>

          {Object.entries(groupedPastSchedules).map(([date, schedules]) => (
            <div key={date} className="flex flex-col gap-3 rounded-md p-5 shadow-md">
              <h1 className="text-xl font-medium">{formatToReadableDate(schedules[0].datetime + "")}</h1>
              <div className="flex gap-2 mt-5">
                {schedules.map((schedule) => (
                  <Button key={schedule.scheduleId} className="w-fit p-10 text-lg" variant="outline" onClick={() => {}}>
                    {formatToReadableTime(schedule.datetime + "")}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CustomerViewShow;

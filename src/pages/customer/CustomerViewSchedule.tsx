import { useGetScheduleInformation, useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule";
import Breadcrumbs from "@/components/BreadCrumbs";
import SeatMap from "@/components/SeatMap";
import type { Schedule } from "@/types/schedule";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";

import { useOutletContext, useParams } from "react-router-dom";

const CustomerViewSchedule = () => {
  const context = useOutletContext<{ schedule?: Schedule }>();
  const { showId, scheduleId } = useParams();

  const {
    data: fetchedSchedule,
    isLoading,
    isError,
  } = useGetScheduleInformation(scheduleId as string, {
    enabled: !context?.schedule,
  });

  const schedule = context?.schedule ?? fetchedSchedule;

  if (isLoading) return <p>Loading schedule...</p>;
  if (!schedule || isError) return <p>Error loading schedule</p>;

  return (
    <div className="mt-20">
      <Breadcrumbs backHref={`/customer/show/${showId}`} items={[{ name: "Change Schedule" }]} />

      <h1 className="text-xl font-medium mt-10">
        {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
      </h1>

      {schedule.seatingType === "controlledSeating" && <ScheduleSeatMap />}

      {schedule.seatingType === "freeSeating" && <div>Input ticket quantity</div>}
    </div>
  );
};

const ScheduleSeatMap = () => {
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  if (isLoading) {
    return <h1>Loadingg</h1>;
  }

  if (isError || !data) {
    return <h1>Error Loading Seat Map</h1>;
  }

  return (
    <SeatMap
      recStyle={(seat) => {
        console.log(seat);
        return "";
      }}
      seatMap={data}
      seatClick={() => {}}
      rowClick={() => {}}
      sectionClick={() => {}}
    />
  );
};

export default CustomerViewSchedule;

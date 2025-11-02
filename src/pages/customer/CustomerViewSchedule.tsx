import { useGetScheduleInformation, useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule";
import Breadcrumbs from "@/components/BreadCrumbs";
import Error from "@/components/Error";
import Loading from "@/components/Loading";
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

  if (isLoading) return <Loading />;
  if (!schedule || isError) return <Error />;

  return (
    <div className="mt-20">
      <Breadcrumbs backHref={`/show/${showId}`} items={[{ name: "Change Schedule" }]} />

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
        return `${seat.ticketControlNumber === 0 && "fill-red"}
                 ${seat.status === "complimentarySeat" && "fill-blue"}
              `;
      }}
      seatMap={data}
      seatClick={(seat) => {
        alert(seat.seatNumber);
      }}
      rowClick={(seats) => {
        alert(seats.map((seat) => seat.seatNumber).join(" "));
      }}
      sectionClick={() => {}}
    />
  );
};

export default CustomerViewSchedule;

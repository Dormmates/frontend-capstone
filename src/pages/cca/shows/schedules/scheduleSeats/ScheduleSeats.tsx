import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "../../../../../types/schedule";
import NotFound from "../../../../NotFound";
import SeatMap from "../../../../../components/ui/SeatMap";
import { useGetScheduleSeatMap } from "../../../../../_lib/@react-client-query/schedule";

const ScheduleSeats = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  if (schedule.seatingType === "freeSeating") return <NotFound />;

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  return (
    <SeatMap
      recStyle={(seat) => "asc"}
      seatMap={data}
      seatClick={(seat) => console.log(seat)}
      rowClick={(seats) => console.log(seats)}
      sectionClick={(seats) => console.log(seats)}
    />
  );
};

export default ScheduleSeats;

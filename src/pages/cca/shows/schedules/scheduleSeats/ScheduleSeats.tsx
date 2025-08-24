import { useOutletContext } from "react-router-dom";
import type { Schedule } from "../../../../../types/schedule";
import NotFound from "../../../../NotFound";

const ScheduleSeats = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();

  if (schedule.seatingType === "freeSeating") return <NotFound />;

  return <div>ScheduleSeats</div>;
};

export default ScheduleSeats;

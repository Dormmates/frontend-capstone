import { useParams } from "react-router-dom";
import SeatMap from "./SeatMap";
import { useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule";

type TicketSeatLocationProps = {
  controlNumber?: number;
  scheduleId?: string;
};

const TicketSeatLocation = ({ controlNumber, scheduleId }: TicketSeatLocationProps) => {
  const { controlNumberParam, scheduleIdParam } = useParams();

  const resolvedScheduleId = scheduleId ?? scheduleIdParam;
  const resolvedControlNumber = controlNumber ?? (controlNumberParam ? Number(controlNumberParam) : undefined);

  const { data, isLoading, isError } = useGetScheduleSeatMap(resolvedScheduleId ?? "");

  if (!resolvedScheduleId) {
    return <h1>No Schedule ID provided</h1>;
  }

  if (isLoading) {
    return <h1>Loading Seat Map</h1>;
  }

  if (!data || isError) {
    return <h1>Failed to load Seat Map</h1>;
  }

  return (
    <div className=" flex justify-center min-h-screen flex-col ">
      <div className="flex justify-start flex-col font-bold">
        <h1>Control Number: {resolvedControlNumber}</h1>
        <p>Seat Number: {data.filter((seat) => seat.ticketControlNumber === resolvedControlNumber).map((seat) => seat.seatNumber)}</p>
      </div>
      <SeatMap seatMap={data} recStyle={(seat) => (seat.ticketControlNumber === resolvedControlNumber ? "fill-blue-400" : "")} />
    </div>
  );
};

export default TicketSeatLocation;

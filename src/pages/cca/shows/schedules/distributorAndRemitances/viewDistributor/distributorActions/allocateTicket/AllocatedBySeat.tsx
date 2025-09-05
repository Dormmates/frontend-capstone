import { useParams } from "react-router-dom";
import { useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule.ts";
import type { FlattenedSeat } from "@/types/seat.ts";
import { useMemo } from "react";
import SeatMap from "@/components/SeatMap";

type Props = {
  choosenSeats: FlattenedSeat[];
  setChoosenSeats: React.Dispatch<React.SetStateAction<FlattenedSeat[]>>;
};

const AllocatedBySeat = ({ choosenSeats, setChoosenSeats }: Props) => {
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const seatAvailabilityCount = useMemo(() => {
    if (!data) return { available: 0, unavailable: 0, reserved: 0, sold: 0 };
    const available = data.filter((seat) => !seat.isComplimentary && seat.ticketControlNumber !== 0 && seat.status === "available").length;
    const reserved = data.filter((seat) => seat.status === "reserved").length;
    const sold = data.filter((seat) => seat.status === "sold").length;
    const unavailable = data.length - available - reserved;

    return { available, unavailable, reserved, sold };
  }, [data]);

  const handleClick = (seat: FlattenedSeat) => {
    setChoosenSeats((prev) => {
      const exists = prev.some((s) => s.seatNumber === seat.seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seat.seatNumber);
      }
      return [...prev, seat];
    });
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError || !data) {
    return <h1>Error</h1>;
  }

  return (
    <>
      <div className="flex flex-col gap-5 -mb-7">
        <h1>Choose Seats</h1>

        <div className="flex justify-between">
          <div>
            <p className="text-lg">
              You have selected: <span className="font-bold">{choosenSeats.length} seats</span>
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-blue-600 border"></div>
              <p>Selected Seats</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-darkGrey border"></div>
              <p>Unavailable Seats : {seatAvailabilityCount.unavailable}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-white border"></div>
              <p>Available Seats: {seatAvailabilityCount.available}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-red border"></div>
              <p>Reserved Seats : {seatAvailabilityCount.reserved}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-green border"></div>
              <p>Sold Seats : {seatAvailabilityCount.sold}</p>
            </div>
          </div>
        </div>
      </div>
      <SeatMap
        disabled={false}
        seatMap={data}
        seatClick={(seat) => {
          if (seat.isComplimentary || seat.ticketControlNumber == 0 || seat.status === "reserved") return;
          handleClick(seat);
        }}
        rowClick={(seats) => console.log(seats)}
        sectionClick={(seats) => console.log(seats)}
        recStyle={(seat) => `${
          seat.isComplimentary || seat.ticketControlNumber == 0 || seat.status == "reserved" || seat.status === "sold"
            ? "fill-darkGrey !cursor-not-allowed"
            : "hover:fill-blue-200 cursor-pointer"
        }
         ${seat.status === "sold" && "fill-green !cursor-not-allowed"}
        ${seat.status === "reserved" && "fill-red !cursor-not-allowed"}
        ${choosenSeats.includes(seat) ? "fill-blue-600" : ""}`}
      />
    </>
  );
};

export default AllocatedBySeat;

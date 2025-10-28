import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import NotFound from "../../../../NotFound";

import { useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule.ts";
import { useMemo } from "react";
import SeatMap from "@/components/SeatMap";

const ScheduleSeats = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const seatSummary = useMemo(() => {
    if (!data)
      return {
        vip: 0,
        complimentary: 0,
        sold: 0,
        reserved: 0,
        available: 0,
        notAvailable: 0,
      };

    return data.reduce(
      (summary, seat) => {
        if (seat.status == "vip") summary.vip++;
        if (seat.isComplimentary) summary.complimentary++;
        if (seat.status === "sold") summary.sold++;
        if (seat.status === "reserved") summary.reserved++;
        if (seat.status === "available" && !seat.isComplimentary && seat.ticketControlNumber !== 0) summary.available++;
        if (seat.ticketControlNumber == 0) summary.notAvailable++;
        return summary;
      },
      { vip: 0, complimentary: 0, sold: 0, reserved: 0, available: 0, notAvailable: 0 }
    );
  }, [data]);

  if (schedule.seatingType === "freeSeating") return <NotFound />;

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl">Seat Map</h1>
      <div className="flex gap-2 flex-col justify-end">
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-blue-500 border"></div>
          <p>Complimentary Seats: {seatSummary.complimentary}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-green border"></div>
          <p>Sold Seats: {seatSummary.sold}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-red border"></div>
          <p>Reserved Seats: {seatSummary.reserved}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-white border"></div>
          <p>Available Seats: {seatSummary.available}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-darkGrey border"></div>
          <p>Not Available Seats: {seatSummary.notAvailable}</p>
        </div>
      </div>

      <SeatMap
        recStyle={(seat) => {
          if (seat.ticketControlNumber === 0) return "fill-darkGrey";
          if (seat.status === "vip") return "fill-primary";
          if (seat.isComplimentary) return "fill-blue-500";
          if (seat.status === "sold") return "fill-green";
          if (seat.status === "reserved") return "fill-red";
          if (seat.status === "available") return "fill-white";
          return "";
        }}
        seatMap={data}
        seatClick={(seat) => console.log(seat)}
        rowClick={(seats) => console.log(seats)}
        sectionClick={(seats) => console.log(seats)}
      />
    </div>
  );
};

export default ScheduleSeats;

import { useOutletContext, useParams } from "react-router-dom";
import type { Schedule } from "@/types/schedule.ts";
import NotFound from "../../../../NotFound";

import { useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule.ts";
import { useMemo } from "react";
import SeatMap from "@/components/SeatMap";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const ScheduleSeats = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const seatSummary = useMemo(() => {
    if (!data)
      return {
        paidToCCA: 0,
        complimentary: 0,
        sold: 0,
        reserved: 0,
        available: 0,
        notAvailable: 0,
      };

    return data.reduce(
      (summary, seat) => {
        if (seat.isComplimentary) summary.complimentary++;
        if (seat.status === "paidToCCA") summary.paidToCCA++;
        if (seat.status === "sold") summary.sold++;
        if (seat.status === "reserved") summary.reserved++;
        if (seat.status === "available" && !seat.isComplimentary && seat.ticketControlNumber !== 0) summary.available++;
        if (seat.ticketControlNumber == 0) summary.notAvailable++;
        return summary;
      },
      { paidToCCA: 0, complimentary: 0, sold: 0, reserved: 0, available: 0, notAvailable: 0 }
    );
  }, [data]);

  if (schedule.seatingType === "freeSeating") return <NotFound />;

  if (isLoading) {
    return <Loading />;
  }

  if (!data || isError) {
    return <Error />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl">Seat Map</h1>
      <div className="flex gap-2 flex-col justify-end">
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-green border"></div>
          <p>Paid To CCA: {seatSummary.paidToCCA}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-primary border"></div>
          <p>Marked Sold By Distributor: {seatSummary.sold}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-red/80 border"></div>
          <p>Reserved Seats: {seatSummary.reserved}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-white border"></div>
          <p>Available Seats: {seatSummary.available}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-5 h-5 bg-darkGrey border"></div>
          <p>Complimentary / Not Available Seats: {seatSummary.notAvailable + seatSummary.complimentary}</p>
        </div>
      </div>

      <SeatMap
        recStyle={(seat) => {
          if (seat.ticketControlNumber === 0) return "fill-darkGrey";
          if (seat.status === "paidToCCA") return "fill-green";
          if (seat.isComplimentary) return "fill-darkGrey";
          if (seat.status === "sold") return "fill-primary";
          if (seat.status === "reserved") return "fill-red/80";
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

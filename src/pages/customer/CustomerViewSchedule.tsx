import { useGetScheduleInformation, useGetScheduleSeatMap } from "@/_lib/@react-client-query/schedule";
import Breadcrumbs from "@/components/BreadCrumbs";
import SeatMap from "@/components/SeatMap";
import type { Schedule } from "@/types/schedule";
import type { FlattenedSeat } from "@/types/seat.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useState } from "react";

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

      <h1 className="text-xl font-medium mt-10 ">
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
  const [selectedSeats, setSelectedSeats] = useState<FlattenedSeat[]>();

  const handleSeatSelection = (clicked: FlattenedSeat | FlattenedSeat[]) => {
    const clickedSeats = Array.isArray(clicked) ? clicked : [clicked];

    setSelectedSeats((prev = []) => {
      const seatNumbers = clickedSeats.map((s) => s.seatNumber);
      const allSelected = clickedSeats.every((s) => prev.some((p) => p.seatNumber === s.seatNumber));

      return allSelected
        ? prev.filter((seat) => !seatNumbers.includes(seat.seatNumber))
        : [...prev, ...clickedSeats.filter((s) => !prev.some((p) => p.seatNumber === s.seatNumber))];
    });
  };

  if (isLoading) {
    return <h1>Loadingg</h1>;
  }

  if (isError || !data) {
    return <h1>Error Loading Seat Map</h1>;
  }

  return (
    <SeatMap
      recStyle={(seat) => {
        return `${
          selectedSeats?.some((s) => s.seatNumber === seat.seatNumber)
            ? "fill-blue-400"
            : seat.status === "reserved" || seat.status === "sold" || seat.status === "vip"
            ? "fill-red"
            : ""
        }`;
      }}
      seatMap={data}
      seatClick={(clickedSeat: FlattenedSeat) => {
        handleSeatSelection(clickedSeat);
      }}
      rowClick={(clickedSeat: FlattenedSeat[]) => {
        handleSeatSelection(clickedSeat);
      }}
      sectionClick={(clickedSeat: FlattenedSeat[]) => {
        handleSeatSelection(clickedSeat);
      }}
    />
  );
};

export default CustomerViewSchedule;

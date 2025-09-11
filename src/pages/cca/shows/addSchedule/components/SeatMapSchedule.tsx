import SeatMap from "@/components/SeatMap.tsx";
import type { FlattenedSeat } from "@/types/seat.ts";
import { useMemo } from "react";

interface Props {
  seatClick?: (seat: FlattenedSeat) => void;
  rowClick?: (seats: FlattenedSeat[]) => void;
  sectionClick?: (seats: FlattenedSeat[]) => void;
  seatMap: FlattenedSeat[];
  disabled?: boolean;
}

const SeatMapSchedule = ({ seatClick, rowClick, sectionClick, seatMap, disabled = false }: Props) => {
  const summary = useMemo(() => {
    if (!seatMap) return { assigned: 0, complimentary: 0 };
    const assigned = seatMap.filter((seat) => seat.ticketControlNumber != 0 && !seat.isComplimentary).length;
    const complimentary = seatMap.filter((seat) => seat.ticketControlNumber != 0 && seat.isComplimentary).length;
    return { assigned, complimentary };
  }, [seatMap]);

  return (
    <div className="flex flex-col  mt-5">
      <div className="flex flex-col self-end gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-400"></div>
          <p className="text-sm">Assigned Seat: {summary.assigned}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-400"></div>
          <p className="text-sm">Complimentary Seat: {summary.complimentary}</p>
        </div>
      </div>
      <SeatMap
        disabled={disabled}
        recStyle={(seat) => {
          return `${seat.ticketControlNumber != 0 && !seat.isComplimentary ? "fill-orange-400" : ""}
            ${seat.ticketControlNumber != 0 && seat.isComplimentary ? "fill-blue-400" : ""}`;
        }}
        seatMap={seatMap}
        seatClick={(seat) => seatClick && seatClick(seat)}
        rowClick={(seats) => rowClick && rowClick(seats)}
        sectionClick={(seats) => sectionClick && sectionClick(seats)}
      />
    </div>
  );
};

export default SeatMapSchedule;

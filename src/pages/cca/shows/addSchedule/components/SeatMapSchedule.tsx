import type { FlattenedSeatMap, FlattenedSeat } from "../../../../../types/seat.ts";
import SeatMap from "../../../../../components/ui/SeatMap.tsx";

interface Props {
  seatClick: (seat: FlattenedSeat) => void;
  rowClick: (seats: FlattenedSeat[]) => void;
  sectionClick: (seats: FlattenedSeat[]) => void;
  seatMap: FlattenedSeatMap;
  disabled?: boolean;
}

const SeatMapSchedule = ({ seatClick, rowClick, sectionClick, seatMap, disabled = false }: Props) => {
  return (
    <div className="flex flex-col gap-5 mt-5">
      <div className="flex self-end gap-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-400"></div>
          <p>Assigned Seat</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-400"></div>
          <p>Complimentary Seat</p>
        </div>
      </div>
      <SeatMap
        disabled={disabled}
        recStyle={(seat) => {
          return `${seat.ticketControlNumber != 0 && !seat.isComplimentary ? "fill-orange-400" : ""}
            ${seat.ticketControlNumber != 0 && seat.isComplimentary ? "fill-blue-400" : ""}`;
        }}
        seatMap={seatMap}
        seatClick={(seat) => seatClick(seat)}
        rowClick={(seats) => rowClick(seats)}
        sectionClick={(seats) => sectionClick(seats)}
      />
    </div>
  );
};

export default SeatMapSchedule;

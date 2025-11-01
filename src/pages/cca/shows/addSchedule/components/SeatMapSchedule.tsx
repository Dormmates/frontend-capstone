import SeatMap from "@/components/SeatMap";
import type { ErrorKeys } from "@/types/schedule";
import type { FlattenedSeat } from "@/types/seat";
import { parseControlNumbers } from "@/utils/controlNumber";
import { sortSeatsByStartingRow } from "@/utils/seatmap";
import { useCallback, useEffect, useMemo, useRef } from "react";

interface Props {
  seatMap: FlattenedSeat[];
  disabled?: boolean;
  setSeatData: React.Dispatch<React.SetStateAction<FlattenedSeat[]>>;
  complimentaryCount: number;
  scheduleData: {
    ticketsControlNumber: string;
  };
  startingRow: string;
  setErrors?: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
  error?: string;
}

const SeatMapSchedule = ({ setErrors, error, startingRow, seatMap, disabled = false, complimentaryCount, setSeatData, scheduleData }: Props) => {
  const prevComplimentaryCount = useRef<number>(complimentaryCount);
  const prevStartingRow = useRef<string>(startingRow);

  const ticketNumbers = useMemo(() => parseControlNumbers(scheduleData.ticketsControlNumber), [scheduleData.ticketsControlNumber]);

  // Track candidate complimentary seats
  const complimentaryCandidates = useRef<Set<string>>(new Set());

  // Assign all seats sequential control numbers, mark candidate complimentary seats
  const assignDefaultSeats = useCallback(
    (data: FlattenedSeat[], compCount: number) => {
      const zones = [
        { row: "AA", range: [1, 8] },
        { row: "L", range: [12, 22] },
        { row: "M", range: [12, 22] },
        { row: "N", range: [12, 13] },
      ];

      const sortedSeats = sortSeatsByStartingRow(data, startingRow);

      // Flatten seats in zones
      const zoneSeats: FlattenedSeat[] = [];
      zones.forEach((z) => {
        zoneSeats.push(
          ...sortedSeats.filter((seat) => {
            const rowLetters = seat.seatNumber.match(/^[A-Z]+/)?.[0] || "";
            const num = parseInt(seat.seatNumber.match(/\d+/)?.[0] || "0", 10);
            return rowLetters === z.row && num >= z.range[0] && num <= z.range[1];
          })
        );
      });

      // Candidate complimentary seats
      const assignedComps = zoneSeats.slice(0, compCount).map((s) => s.seatNumber);
      complimentaryCandidates.current = new Set(assignedComps);

      // Assign sequential ticket numbers to all seats
      return sortedSeats.map((seat, idx) => ({
        ...seat,
        isComplimentary: assignedComps.includes(seat.seatNumber),
        ticketControlNumber: ticketNumbers[idx] || 0,
      }));
    },
    [ticketNumbers, startingRow]
  );

  const toggleSeats = useCallback(
    (clickedSeats: FlattenedSeat | FlattenedSeat[]) => {
      setSeatData((prev) => {
        const updated = prev.map((s) => ({ ...s }));
        const seatsToToggle = Array.isArray(clickedSeats) ? clickedSeats : [clickedSeats];

        // Detect if any seat in the selection is already complimentary
        const hasAnyComplimentary = seatsToToggle.some(
          (seat) => updated.find((s) => s.seatNumber === seat.seatNumber && s.section === seat.section)?.isComplimentary
        );

        let currentCompCount = updated.filter((s) => s.isComplimentary).length;

        seatsToToggle.forEach((seat) => {
          const idx = updated.findIndex((s) => s.seatNumber === seat.seatNumber && s.section === seat.section);
          if (idx === -1) return;

          if (hasAnyComplimentary) {
            // Remove all isComplimentary in this selection
            if (updated[idx].isComplimentary) {
              updated[idx].isComplimentary = false;
              currentCompCount--;
            }
          } else if (!updated[idx].isComplimentary && currentCompCount < complimentaryCount) {
            // Assign only if under the limit
            updated[idx].isComplimentary = true;
            currentCompCount++;
          }
        });

        return updated;
      });
    },
    [complimentaryCount, setSeatData]
  );

  useEffect(() => {
    if (!setErrors) return;

    const assignedComplimentary = seatMap.filter((s) => s.isComplimentary).length;

    if (assignedComplimentary < complimentaryCount) {
      setErrors((prev) => ({ ...prev, complimentary: `Please assign all ${complimentaryCount} complimentary seats.` }));
    } else {
      setErrors((prev) => {
        const { complimentary, ...rest } = prev;
        return rest;
      });
    }
  }, [seatMap, complimentaryCount, setErrors]);

  useEffect(() => {
    const hasSeatsAssigned = seatMap.some((s) => s.ticketControlNumber !== 0);
    if (!hasSeatsAssigned || prevComplimentaryCount.current !== complimentaryCount) {
      setSeatData(assignDefaultSeats(seatMap, Math.min(complimentaryCount, seatMap.length)));
      prevComplimentaryCount.current = complimentaryCount;
    }
  }, [seatMap, complimentaryCount, assignDefaultSeats, setSeatData]);

  // Update when starting row changes without resetting complimentary assignments
  useEffect(() => {
    if (prevStartingRow.current !== startingRow) {
      setSeatData((prev) => {
        const sortedSeats = sortSeatsByStartingRow(prev, startingRow);

        // Keep existing isComplimentary and just reassign ticket numbers sequentially
        return sortedSeats.map((seat, idx) => ({
          ...seat,
          ticketControlNumber: ticketNumbers[idx] || 0,
        }));
      });
      prevStartingRow.current = startingRow;
    }
  }, [seatMap, startingRow, ticketNumbers, setSeatData]);

  const summary = useMemo(() => {
    const assignedRegular = seatMap.filter((s) => s.ticketControlNumber !== 0 && !s.isComplimentary).length;
    const assignedComplimentary = seatMap.filter((s) => s.isComplimentary).length;

    return {
      assignedRegular,
      assignedComplimentary,
      regularRemaining: seatMap.length - assignedRegular - assignedComplimentary,
      complimentaryRemaining: Math.max(complimentaryCount - assignedComplimentary, 0),
    };
  }, [seatMap, complimentaryCount]);

  return (
    <div className="flex flex-col">
      {/* Summary */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-400 rounded-sm"></div>
          <p className="text-sm">
            Regular Seats Assigned: {summary.assignedRegular} ({summary.regularRemaining} remaining)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-400 rounded-sm"></div>
          <p className="text-sm">
            Complimentary Seats Assigned: {summary.assignedComplimentary} ({summary.complimentaryRemaining} remaining)
          </p>
        </div>
      </div>

      <p className="text-sm text-red mb-2">{error}</p>
      <div className={`${error && "w-full h-full border-red p-2 border-2 rounded-md"}`}>
        <SeatMap
          disabled={disabled}
          seatMap={seatMap}
          seatClick={toggleSeats}
          rowClick={toggleSeats}
          recStyle={(seat) => {
            if (seat.isComplimentary) return "fill-blue-400";
            const allCompsAssigned = seatMap.filter((s) => s.isComplimentary).length >= complimentaryCount;
            if (!seat.isComplimentary && seat.ticketControlNumber !== 0 && allCompsAssigned) return "fill-orange-400";
            return "";
          }}
        />
      </div>
    </div>
  );
};

export default SeatMapSchedule;

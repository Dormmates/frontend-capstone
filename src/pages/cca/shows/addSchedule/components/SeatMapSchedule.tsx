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
    complimentaryControlNumber: string;
  };
  startingRow: string;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<ErrorKeys, string>>>>;
  error?: string;
}

const SeatMapSchedule = ({ setErrors, error, startingRow, seatMap, disabled = false, complimentaryCount, setSeatData, scheduleData }: Props) => {
  const prevComplimentaryCount = useRef<number>(complimentaryCount);
  const prevStartingRow = useRef<string>(startingRow);
  const ticketNumbers = useMemo(() => parseControlNumbers(scheduleData.ticketsControlNumber), [scheduleData.ticketsControlNumber]);
  const complimentaryNumbers = useMemo(() => parseControlNumbers(scheduleData.complimentaryControlNumber), [scheduleData.complimentaryControlNumber]);

  const toggleSeats = useCallback(
    (clickedSeats: FlattenedSeat | FlattenedSeat[]) => {
      setSeatData((prev) => {
        let updated = [...prev];
        const seatsToToggle = Array.isArray(clickedSeats) ? clickedSeats : [clickedSeats];

        let compChanged = false;

        seatsToToggle.forEach((clickedSeat) => {
          const index = updated.findIndex((s) => s.seatNumber === clickedSeat.seatNumber && s.section === clickedSeat.section);
          if (index === -1) return;

          const seat = updated[index];

          if (seat.isComplimentary) {
            updated[index] = { ...seat, isComplimentary: false, ticketControlNumber: 0 };
            compChanged = true;
          } else {
            const compAssignedCount = updated.filter((s) => s.isComplimentary).length;
            if (compAssignedCount >= complimentaryCount) return;

            const assignedNumbers = updated.filter((s) => s.isComplimentary).map((s) => s.ticketControlNumber);
            const nextControlNumber = complimentaryNumbers.find((n) => !assignedNumbers.includes(n)) || 0;

            updated[index] = { ...seat, isComplimentary: true, ticketControlNumber: nextControlNumber };
            compChanged = true;
          }
        });

        if (compChanged) {
          const compAssignedCount = updated.filter((s) => s.isComplimentary).length;
          if (compAssignedCount < complimentaryCount) {
            updated = updated.map((s) => (s.isComplimentary ? s : { ...s, ticketControlNumber: 0 }));
          } else {
            let regIdx = 0;
            updated = updated.map((s) => {
              if (!s.isComplimentary && regIdx < ticketNumbers.length) {
                return { ...s, ticketControlNumber: ticketNumbers[regIdx++] };
              }
              return s;
            });
          }
        }

        return updated;
      });
    },
    [complimentaryCount, complimentaryNumbers, ticketNumbers, setSeatData]
  );

  useEffect(() => {
    const hasAssignedSeats = seatMap.some((s) => s.isComplimentary || s.ticketControlNumber !== 0);

    if (!hasAssignedSeats || prevComplimentaryCount.current !== complimentaryCount) {
      setSeatData((prev) => {
        const sortedSeats = sortSeatsByStartingRow(prev, startingRow);

        const zones = [
          { row: "A", range: [1, 10] },
          { row: "M", range: [12, 22] },
          { row: "N", range: [12, 23] },
        ];

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

        const assignedComps = zoneSeats.slice(0, complimentaryCount);

        let compIdx = 0;
        let regIdx = 0;

        return sortedSeats.map((seat) => {
          if (assignedComps.find((s) => s.seatNumber === seat.seatNumber)) {
            return {
              ...seat,
              isComplimentary: true,
              ticketControlNumber: complimentaryNumbers[compIdx++] || 0,
            };
          } else {
            return {
              ...seat,
              isComplimentary: false,
              ticketControlNumber: ticketNumbers[regIdx++] || 0,
            };
          }
        });
      });

      prevComplimentaryCount.current = complimentaryCount;
    }
  }, [complimentaryCount, seatMap, scheduleData]);

  useEffect(() => {
    if (prevStartingRow.current === startingRow) return;

    setSeatData((prev) => {
      const sortedSeats = sortSeatsByStartingRow(prev, startingRow);

      let compIdx = 0;
      let regIdx = 0;

      const updated = sortedSeats.map((seat) => {
        if (seat.isComplimentary) {
          const ticketNumber = complimentaryNumbers[compIdx++] || 0;
          return { ...seat, ticketControlNumber: ticketNumber };
        } else {
          const ticketNumber = ticketNumbers[regIdx++] || 0;
          return { ...seat, ticketControlNumber: ticketNumber };
        }
      });

      return updated;
    });

    prevStartingRow.current = startingRow;
  }, [startingRow, complimentaryNumbers, ticketNumbers, setSeatData]);

  useEffect(() => {
    setSeatData((prev) => {
      const updated = [...prev];
      const compAssignedCount = updated.filter((s) => s.isComplimentary).length;

      if (compAssignedCount < complimentaryCount) {
        return updated.map((s) => (s.isComplimentary ? s : { ...s, ticketControlNumber: 0 }));
      }

      let regIdx = 0;
      for (const seat of updated) {
        if (!seat.isComplimentary && regIdx < ticketNumbers.length) {
          seat.ticketControlNumber = ticketNumbers[regIdx++];
        }
      }

      return updated;
    });
  }, [ticketNumbers, complimentaryCount, setSeatData]);

  useEffect(() => {
    const assignedComps = seatMap.filter((s) => s.isComplimentary && s.ticketControlNumber !== 0).length;

    if (assignedComps < complimentaryCount) {
      setErrors((prev) => ({
        ...prev,
        complimentary: `Please assign all ${complimentaryCount} complimentary seats before proceeding.`,
      }));
    } else {
      setErrors((prev) => {
        const { complimentary, ...rest } = prev;
        return rest;
      });
    }
  }, [seatMap, complimentaryCount, setErrors]);

  const summary = useMemo(() => {
    const assignedRegular = seatMap.filter((s) => s.ticketControlNumber !== 0 && !s.isComplimentary).length;
    const assignedComplimentary = seatMap.filter((s) => s.isComplimentary && s.ticketControlNumber !== 0).length;
    return {
      assignedRegular,
      assignedComplimentary,
      regularRemaining: seatMap.length - assignedRegular - assignedComplimentary,
      complimentaryRemaining: Math.max(complimentaryCount - assignedComplimentary, 0),
    };
  }, [seatMap, complimentaryCount]);

  return (
    <div className="flex flex-col">
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

      {error && <p className="text-sm text-red mb-2">{error}</p>}

      <div className={`${error && "p-2 border border-red rounded-md shadow-sm shadow-red/25"}`}>
        <SeatMap
          disabled={disabled}
          seatMap={seatMap}
          seatClick={(seat) => toggleSeats(seat)}
          rowClick={(rowSeats) => toggleSeats(rowSeats)}
          recStyle={(seat) => {
            if (seat.isComplimentary && seat.ticketControlNumber !== 0) return "fill-blue-400";
            if (!seat.isComplimentary && seat.ticketControlNumber !== 0) return "fill-orange-400";
            return "";
          }}
        />
      </div>
    </div>
  );
};

export default SeatMapSchedule;

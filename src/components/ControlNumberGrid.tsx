import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { compressControlNumbers } from "@/utils/controlNumber";
import Pagination from "./Pagination";

type ControlNumberGridProps = {
  tickets: number[];
  disabled?: boolean;

  selectedControlNumbers: number[];
  setSelectedControlNumbers: React.Dispatch<React.SetStateAction<number[]>>;

  selectedLostTickets?: number[];
  setSelectedLostTickets?: React.Dispatch<React.SetStateAction<number[]>>;

  maxSelectable?: number;
  allowSlideSelection?: boolean;
  addLost?: boolean;
};

const ControlNumberGrid = ({
  tickets,
  disabled = false,

  selectedControlNumbers,
  setSelectedControlNumbers,

  selectedLostTickets,
  setSelectedLostTickets,

  maxSelectable,
  allowSlideSelection = true,
  addLost = false,
}: ControlNumberGridProps) => {
  const pageSize = 100;
  const [page, setPage] = useState(1);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredTickets, setHoveredTickets] = useState<number[]>([]);
  const [markAs, setMarkAs] = useState<"sold" | "lost">("sold");

  const currentPageTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, page]);

  const toggleSelection = (ticket: number) => {
    if (markAs === "sold") {
      setSelectedControlNumbers((prev) => {
        const alreadySelected = prev.includes(ticket);
        let newSelection = [...prev];

        if (alreadySelected) {
          newSelection = newSelection.filter((t) => t !== ticket);
        } else {
          if (maxSelectable && newSelection.length >= maxSelectable) {
            newSelection.shift();
          }
          newSelection.push(ticket);
        }

        if (setSelectedLostTickets) {
          setSelectedLostTickets((lostPrev) => lostPrev.filter((t) => t !== ticket));
        }

        return newSelection.sort((a, b) => a - b);
      });
    } else if (markAs === "lost" && setSelectedLostTickets) {
      setSelectedLostTickets((prev) => {
        const alreadySelected = prev.includes(ticket);
        let newSelection = [...prev];

        if (alreadySelected) {
          newSelection = newSelection.filter((t) => t !== ticket);
        } else {
          if (maxSelectable && newSelection.length >= maxSelectable) {
            newSelection.shift();
          }
          newSelection.push(ticket);
        }

        setSelectedControlNumbers((soldPrev) => soldPrev.filter((t) => t !== ticket));

        return newSelection.sort((a, b) => a - b);
      });
    }
  };

  const handleMouseDown = (ticket: number) => {
    if (disabled) return;

    setIsMouseDown(true);
    setHoveredTickets([ticket]);
    if (!allowSlideSelection) toggleSelection(ticket);
  };

  const handleMouseEnter = (ticket: number) => {
    if (!isMouseDown || disabled || !allowSlideSelection) return;
    setHoveredTickets((prev) => (prev.includes(ticket) ? prev : [...prev, ticket]));
  };

  const handleMouseUp = () => {
    if (!isMouseDown || disabled) {
      setHoveredTickets([]);
      setIsMouseDown(false);
      return;
    }

    if (allowSlideSelection && hoveredTickets.length > 0) {
      hoveredTickets.forEach((ticket) => {
        toggleSelection(ticket);
      });
    }

    setHoveredTickets([]);
    setIsMouseDown(false);
  };

  return (
    <div className="space-y-4 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {!disabled && (
        <div className="flex items-center gap-2">
          {!maxSelectable && (
            <Button
              onClick={() => {
                if (markAs === "sold") {
                  const newTickets = maxSelectable ? tickets.slice(0, maxSelectable) : tickets;
                  setSelectedControlNumbers(newTickets);
                  if (setSelectedLostTickets) {
                    setSelectedLostTickets([]);
                  }
                } else if (markAs === "lost" && setSelectedLostTickets) {
                  const newTickets = maxSelectable ? tickets.slice(0, maxSelectable) : tickets;
                  setSelectedLostTickets(newTickets);
                  setSelectedControlNumbers([]);
                }
              }}
              variant="secondary"
              size="sm"
            >
              Select All
            </Button>
          )}

          {!maxSelectable && (
            <Button
              onClick={() => {
                setSelectedControlNumbers([]);
                if (setSelectedLostTickets) {
                  setSelectedLostTickets([]);
                }
              }}
              variant="secondary"
              size="sm"
            >
              Clear Selection
            </Button>
          )}
        </div>
      )}
      <div className="text-sm font-bold space-y-1">
        <p>
          {addLost ? "Sold" : "Selected: "} ({selectedControlNumbers.length}): {compressControlNumbers(selectedControlNumbers)}
        </p>
        {addLost && (
          <p>
            Lost ({selectedLostTickets?.length ?? 0}): {compressControlNumbers(selectedLostTickets ?? [])}
          </p>
        )}
      </div>

      {addLost && !disabled && (
        <>
          <div className="flex flex-col w-fit gap-1">
            <Button onClick={() => setMarkAs(markAs === "sold" ? "lost" : "sold")} size="sm" variant={markAs === "sold" ? "destructive" : "default"}>
              {markAs === "lost" ? "Switch to Sold Mode" : "Switch to Lost Mode"}
            </Button>

            <p className="text-sm">{markAs === "lost" ? "Marking Tickets as Lost" : "Marking Tickets As Sold"}</p>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-1">
        {currentPageTickets.map((ticket) => {
          const isSold = selectedControlNumbers.includes(ticket);
          const isLost = selectedLostTickets?.includes(ticket);
          const isHovered = hoveredTickets.includes(ticket);

          return (
            <Button
              key={ticket}
              onMouseDown={() => handleMouseDown(ticket)}
              onMouseEnter={() => handleMouseEnter(ticket)}
              onClick={() => {
                if (!allowSlideSelection) toggleSelection(ticket);
              }}
              className={`transition-all duration-100 ${
                isHovered
                  ? "bg-blue-200 border-blue-400 text-blue-800"
                  : isSold
                  ? "border-green border-2 font-bold"
                  : isLost
                  ? "border-red border-2 font-bold"
                  : ""
              }`}
              disabled={disabled}
              variant="outline"
              size="icon"
            >
              {ticket}
            </Button>
          );
        })}
      </div>

      <Pagination currentPage={page} totalPage={Math.ceil(tickets.length / pageSize)} onPageChange={(newPage) => setPage(newPage)} />
    </div>
  );
};

export default ControlNumberGrid;

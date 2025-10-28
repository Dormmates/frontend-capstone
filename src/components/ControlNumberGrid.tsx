import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { compressControlNumbers } from "@/utils/controlNumber";
import Pagination from "./Pagination";

type ControlNumberGridProps = {
  tickets: number[];
  disabled?: boolean;
  selectedControlNumbers: number[];
  setSelectedControlNumbers: React.Dispatch<React.SetStateAction<number[]>>;
  maxSelectable?: number;
  allowSlideSelection?: boolean;
};

const ControlNumberGrid = ({
  tickets,
  disabled = false,
  selectedControlNumbers,
  setSelectedControlNumbers,
  maxSelectable,
  allowSlideSelection = true,
}: ControlNumberGridProps) => {
  const pageSize = 100;
  const [page, setPage] = useState(1);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"add" | "remove" | null>(null);
  const [hoveredTickets, setHoveredTickets] = useState<number[]>([]);

  const currentPageTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return tickets.slice(start, end);
  }, [tickets, page]);

  const toggleSelection = (ticket: number) => {
    setSelectedControlNumbers((prev) => {
      if (maxSelectable === 1) {
        if (prev[0] === ticket) return prev;
        return [ticket];
      }

      const isSelected = prev.includes(ticket);
      let updated = [...prev];

      if (isSelected) {
        updated = updated.filter((t) => t !== ticket);
      } else {
        if (maxSelectable && updated.length >= maxSelectable) {
          updated.shift();
        }
        updated.push(ticket);
      }

      return Array.from(new Set(updated)).sort((a, b) => a - b);
    });
  };

  const handleMouseDown = (ticket: number) => {
    if (disabled) return;
    const isSelected = selectedControlNumbers.includes(ticket);
    setSelectionMode(isSelected ? "remove" : "add");
    setIsMouseDown(true);
    setHoveredTickets([ticket]);
    if (!allowSlideSelection) {
      toggleSelection(ticket);
    }
  };

  const handleMouseEnter = (ticket: number) => {
    if (!isMouseDown || disabled || !allowSlideSelection) return;
    setHoveredTickets((prev) => (prev.includes(ticket) ? prev : [...prev, ticket]));
  };

  const handleMouseUp = () => {
    if (!isMouseDown || disabled) {
      setHoveredTickets([]);
      setIsMouseDown(false);
      setSelectionMode(null);
      return;
    }

    if (allowSlideSelection && hoveredTickets.length > 0) {
      setSelectedControlNumbers((prev) => {
        const updated = new Set(prev);
        for (const ticket of hoveredTickets) {
          if (selectionMode === "add" && (!maxSelectable || updated.size < maxSelectable)) {
            updated.add(ticket);
          } else if (selectionMode === "add" && maxSelectable && updated.size >= maxSelectable) {
            updated.delete([...updated][0]);
            updated.add(ticket);
          } else if (selectionMode === "remove") {
            updated.delete(ticket);
          }
        }
        return Array.from(updated).sort((a, b) => a - b);
      });
    }

    setHoveredTickets([]);
    setIsMouseDown(false);
    setSelectionMode(null);
  };

  return (
    <div className="space-y-4 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {!disabled && (
        <div className="flex items-center gap-2">
          {!maxSelectable && (
            <Button
              onClick={() => {
                if (maxSelectable) {
                  setSelectedControlNumbers(tickets.slice(0, maxSelectable));
                } else {
                  setSelectedControlNumbers(tickets);
                }
              }}
              variant="secondary"
              size="sm"
            >
              Select All
            </Button>
          )}

          {!maxSelectable && (
            <Button onClick={() => setSelectedControlNumbers([])} variant="secondary" size="sm">
              Clear Selection
            </Button>
          )}
        </div>
      )}

      <p className="text-sm font-bold">
        Selected ({selectedControlNumbers.length}
        {maxSelectable ? ` / ${maxSelectable}` : ""}) : {compressControlNumbers(selectedControlNumbers)}
      </p>

      <div className="flex flex-wrap gap-1">
        {currentPageTickets.map((ticket) => {
          const isSelected = selectedControlNumbers.includes(ticket);
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
                isHovered ? "bg-blue-200 border-blue-400 text-blue-800" : isSelected ? "border-green border-2 font-bold" : ""
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

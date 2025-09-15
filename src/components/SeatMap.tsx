import React, { useRef, useState } from "react";
import type { FlattenedSeat } from "../types/seat.ts";
import { formatSectionName } from "../utils/seatmap.ts";

interface Props {
  seatClick?: (seat: FlattenedSeat) => void;
  rowClick?: (seats: FlattenedSeat[]) => void;
  sectionClick?: (seats: FlattenedSeat[]) => void;
  recStyle?: (seat: FlattenedSeat) => string;
  seatMap: FlattenedSeat[];
  disabled?: boolean;
  width?: string | number;
  height?: string | number;
}

const SeatMap = ({ seatClick, rowClick, sectionClick, recStyle, seatMap, disabled = false, width = "100%", height = "100%" }: Props) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState<null | FlattenedSeat>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<SVGRectElement>, seat: FlattenedSeat) => {
    const mouseX = e.clientX + 10;
    const mouseY = e.clientY + 10;

    setTooltipPos({ x: mouseX, y: mouseY });
    setHoveredSeat(seat);
  };

  const handleMouseMoveOverSeat = (e: React.MouseEvent<SVGRectElement>) => {
    setTooltipPos({ x: e.clientX + 10, y: e.clientY + 10 });
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Group seats by section and then by row
  const grouped = seatMap.reduce<Record<string, Record<string, FlattenedSeat[]>>>((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = {};
    if (!acc[seat.section][seat.row]) acc[seat.section][seat.row] = [];
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5 mt-5">
      <div className="relative w-full h-[80vh] border border-gray-300 rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-10 flex space-x-2">
          <button onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))} className="px-3 py-1 bg-white border border-gray-300 rounded shadow">
            +
          </button>
          <button onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))} className="px-3 py-1 bg-white border border-gray-300 rounded shadow">
            -
          </button>
          <button onClick={resetView} className="px-3 py-1 bg-white border border-gray-300 rounded shadow">
            Reset
          </button>
        </div>

        <div className="w-full h-full overflow-hidden flex justify-center items-center">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox="0 0 1051 740"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: "0 0",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {Object.entries(grouped).map(([sectionName, rows]) => (
              <g key={sectionName} id={sectionName.replace(/\s+/g, "_")}>
                {Object.entries(rows).map(([rowName, seats]) => {
                  const seatNumbers = seats.map((s) => parseInt(s.seatNumber.match(/\d+/)?.[0] || "0"));
                  const rowLabel = `${rowName.replace(/[0-9-]/g, "")} ${Math.min(...seatNumbers)}-${Math.max(...seatNumbers)}`;

                  return (
                    <g key={`${sectionName}-${rowName}`}>
                      <text
                        className={`${!disabled ? "hover:underline cursor-pointer" : ""}`}
                        onClick={!disabled ? () => rowClick && rowClick(seats) : undefined}
                        onMouseEnter={!disabled ? () => setHoveredRow(`${sectionName}-${rowName}`) : undefined}
                        onMouseLeave={!disabled ? () => setHoveredRow(null) : undefined}
                        x={seats[0].x - 5}
                        y={seats[0].y + 10}
                        fontSize="10"
                        transform={seats[0].rotation as string}
                        textAnchor="end"
                        fill="black"
                      >
                        {rowLabel}
                      </text>

                      {seats.map((seat) => (
                        <rect
                          transform={seat.rotation as string}
                          key={seat.seatNumber}
                          id={seat.seatNumber}
                          x={seat.x}
                          y={seat.y}
                          width="14"
                          height="14"
                          fill="#ffffff"
                          stroke="black"
                          className={`transition-colors 
                            ${disabled ? "cursor-not-allowed" : "cursor-pointer"} 
                            ${hoveredSection === `${sectionName}` ? "fill-blue-200" : !disabled ? "hover:fill-blue-200" : ""}
                            ${hoveredRow === `${sectionName}-${rowName}` ? "fill-blue-200" : !disabled ? "hover:fill-blue-200" : ""}
                            ${recStyle && recStyle(seat)}
                        `}
                          onClick={!disabled ? () => seatClick && seatClick(seat) : undefined}
                          onMouseEnter={!disabled ? (e) => handleMouseEnter(e, seat) : undefined}
                          onMouseMove={!disabled ? handleMouseMoveOverSeat : undefined}
                          onMouseLeave={!disabled ? () => setHoveredSeat(null) : undefined}
                        />
                      ))}
                    </g>
                  );
                })}

                {(() => {
                  const allSeats = Object.values(rows).flat();
                  if (allSeats.length === 0) return null;
                  const minX = Math.min(...allSeats.map((seat) => seat.x));
                  const minY = Math.min(...allSeats.map((seat) => seat.y));
                  return (
                    <text
                      className={`${!disabled ? "hover:underline cursor-pointer" : ""}`}
                      onMouseEnter={!disabled ? () => setHoveredSection(`${sectionName}`) : undefined}
                      onMouseLeave={!disabled ? () => setHoveredSection(null) : undefined}
                      onClick={
                        !disabled
                          ? () => {
                              const sectionSeats = Object.entries(rows)
                                .map(([_, rows]) => rows)
                                .flat();
                              sectionClick && sectionClick(sectionSeats);
                            }
                          : undefined
                      }
                      x={minX + 100 / 2}
                      y={minY - 50}
                      fontSize="12"
                      fontWeight="bold"
                      fill="black"
                    >
                      {sectionName.replace(/_/g, " ").toUpperCase()}
                    </text>
                  );
                })()}
              </g>
            ))}
          </svg>

          {hoveredSeat && (
            <div
              ref={tooltipRef}
              className="fixed z-20 bg-white shadow-lg rounded px-2 py-1 text-xs border border-gray-300"
              style={{
                top: tooltipPos.y,
                left: tooltipPos.x,
                pointerEvents: "none",
              }}
            >
              {disabled ? (
                <div className="text-red-600">Cannot select</div>
              ) : (
                <>
                  <div>
                    <strong>{hoveredSeat.seatNumber}</strong>
                  </div>
                  <div>Section: {formatSectionName(hoveredSeat.section)}</div>
                  <div>Row: {hoveredSeat.row}</div>
                  {!hoveredSeat.isComplimentary && hoveredSeat.ticketPrice !== 0 && <div>Price: ₱{hoveredSeat.ticketPrice}</div>}
                  {hoveredSeat.ticketControlNumber === 0 ? (
                    <div className="font-bold">Not Assigned Seat</div>
                  ) : (
                    <div>Ticket Control Number: {hoveredSeat.ticketControlNumber}</div>
                  )}
                  {hoveredSeat.distributor && hoveredSeat.status === "reserved" && (
                    <div className="font-bold">Reserved to: {hoveredSeat.distributor.name}</div>
                  )}
                  {hoveredSeat.isComplimentary && <div className="font-bold">Complimentary Seat</div>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;

import { useParams } from "react-router-dom";
import { useGetScheduleSeatMap } from "../../../../../_lib/@react-client-query/schedule";
import type { FlattenedSeat } from "../../../../../types/seat";
import { useRef, useState } from "react";

const AllocatedBySeat = () => {
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

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
    const rect = e.currentTarget.getBoundingClientRect();

    setTooltipPos({
      x: rect.x,
      y: rect.y,
    });

    setHoveredSeat(seat);
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

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError || !data) {
    return <h1>Error</h1>;
  }

  const grouped = data.reduce<Record<string, Record<string, FlattenedSeat[]>>>((acc, seat) => {
    if (!acc[seat.section]) acc[seat.section] = {};
    if (!acc[seat.section][seat.row]) acc[seat.section][seat.row] = [];
    acc[seat.section][seat.row].push(seat);
    return acc;
  }, {});

  return (
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
          width="1405"
          height="492"
          viewBox="-50 -50 1105 492"
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
                const rowLabel = `${rowName} ${Math.min(...seatNumbers)}-${Math.max(...seatNumbers)}`;

                return (
                  <g key={`${sectionName}-${rowName}`}>
                    <text x={seats[0].x - 5} y={seats[0].y + 12} fontSize="10" textAnchor="end" fill="black">
                      {rowLabel}
                    </text>

                    {seats.map((seat) => (
                      <rect
                        key={seat.seatNumber}
                        id={seat.seatNumber}
                        x={seat.x}
                        y={seat.y}
                        width="14"
                        height="14"
                        stroke="black"
                        onMouseEnter={(e) => handleMouseEnter(e, seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
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
                  <text x={minX} y={minY - 10} fontSize="12" fontWeight="bold" fill="black">
                    {sectionName.replace(/_/g, " ").toUpperCase()}
                  </text>
                );
              })()}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default AllocatedBySeat;

import { useParams } from "react-router-dom";
import { useGetScheduleSeatMap } from "../../../../../../_lib/@react-client-query/schedule";
import type { FlattenedSeat } from "../../../../../../types/seat";
import { useMemo, useRef, useState } from "react";
import { formatSectionName } from "../../../../../../utils/seatmap";

type Props = {
  choosenSeats: FlattenedSeat[];
  setChoosenSeats: React.Dispatch<React.SetStateAction<FlattenedSeat[]>>;
};

const AllocatedBySeat = ({ choosenSeats, setChoosenSeats }: Props) => {
  const { scheduleId } = useParams();
  const { data, isLoading, isError } = useGetScheduleSeatMap(scheduleId as string);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState<null | FlattenedSeat>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const seatAvailabilityCount = useMemo(() => {
    if (!data) return { available: 0, unavailable: 0, reserved: 0 };
    const available = data.filter((seat) => !seat.isComplimentary && seat.ticketControlNumber !== 0 && seat.status === "available").length;
    const reserved = data.filter((seat) => seat.status === "reserved").length;
    const unavailable = data.length - available - reserved;

    return { available, unavailable, reserved };
  }, [data]);

  const handleMouseEnter = (e: React.MouseEvent<SVGRectElement>, seat: FlattenedSeat) => {
    const mouseX = e.clientX + 10;
    const mouseY = e.clientY + 10;

    setTooltipPos({ x: mouseX, y: mouseY });
    setHoveredSeat(seat);

    console.log(hoveredSeat);
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

  const handleClick = (seat: FlattenedSeat) => {
    setChoosenSeats((prev) => {
      const exists = prev.some((s) => s.seatNumber === seat.seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seat.seatNumber);
      }
      return [...prev, seat];
    });
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
    <>
      <div className="flex flex-col gap-5 -mb-7">
        <h1>Choose Seats</h1>

        <div className="flex justify-between">
          <div>
            <p className="text-lg">
              You have selected: <span className="font-bold">{choosenSeats.length} seats</span>
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-blue-600 border"></div>
              <p>Selected Seats</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-darkGrey border"></div>
              <p>Unavailable Seats : {seatAvailabilityCount.unavailable}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-white border"></div>
              <p>Available Seats: {seatAvailabilityCount.available}</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 bg-red border"></div>
              <p>Reserved Seats : {seatAvailabilityCount.reserved}</p>
            </div>
          </div>
        </div>
      </div>
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
                          fill="#ffffff"
                          className={`transition-colors
                        ${
                          seat.isComplimentary || seat.ticketControlNumber == 0 || seat.status == "reserved"
                            ? "fill-darkGrey !cursor-not-allowed"
                            : "hover:fill-blue-200 cursor-pointer"
                        }
                        ${seat.status === "reserved" && "fill-red !cursor-not-allowed"}
                        ${choosenSeats.includes(seat) ? "fill-blue-600" : ""}
                        `}
                          onMouseEnter={(e) => handleMouseEnter(e, seat)}
                          onMouseMove={handleMouseMoveOverSeat}
                          onMouseLeave={() => setHoveredSeat(null)}
                          onClick={() => {
                            if (seat.isComplimentary || seat.ticketControlNumber == 0 || seat.status === "reserved") return;
                            handleClick(seat);
                          }}
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
          <>
            <div>
              <strong>{hoveredSeat.seatNumber}</strong>
            </div>
            <div>Section: {formatSectionName(hoveredSeat.section)}</div>
            <div>Row: {hoveredSeat.row}</div>
            <div>Price: ₱{hoveredSeat.ticketPrice}</div>
            <div>Ticket Control Number: {hoveredSeat.ticketControlNumber == 0 ? "Not Assigned" : hoveredSeat.ticketControlNumber}</div>
          </>
        </div>
      )}
    </>
  );
};

export default AllocatedBySeat;

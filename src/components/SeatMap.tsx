import React, { useRef, useState } from "react";
import type { FlattenedSeat } from "../types/seat.ts";
import { formatSectionName } from "../utils/seatmap.ts";
import { Button } from "./ui/button.tsx";

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
    <div className="flex  flex-col gap-5">
      <div className="relative w-full h-[80vh] border border-gray-300 rounded-lg overflow-hidden bg-muted">
        <div className="absolute top-2 left-2 z-10 flex space-x-2">
          <Button variant="outline" onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}>
            +
          </Button>
          <Button variant="outline" onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}>
            -
          </Button>
          <Button variant="outline" onClick={resetView}>
            Reset View
          </Button>
        </div>

        <div className="w-full h-full overflow-hidden flex justify-center items-center">
          <svg
            viewBox="0 0 1101 790"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            ref={svgRef}
            width={width}
            height={height}
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
            <g>
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
                          fill="currentColor"
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

                    // Find the "first row" (smallest y)
                    const firstRowSeats = Object.values(rows).reduce((minRow, currentRow) => {
                      const currentMinY = Math.min(...currentRow.map((s) => s.y));
                      const minRowY = Math.min(...minRow.map((s) => s.y));
                      return currentMinY < minRowY ? currentRow : minRow;
                    });

                    // Get midpoint X of the first row
                    const minX = Math.min(...firstRowSeats.map((s) => s.x));
                    const maxX = Math.max(...firstRowSeats.map((s) => s.x));
                    const midX = (minX + maxX) / 2;

                    // Place label above first row
                    const minY = Math.min(...firstRowSeats.map((s) => s.y));

                    return (
                      <text
                        className={`${!disabled ? "hover:underline cursor-pointer" : ""}`}
                        onMouseEnter={!disabled ? () => setHoveredSection(`${sectionName}`) : undefined}
                        onMouseLeave={!disabled ? () => setHoveredSection(null) : undefined}
                        onClick={
                          !disabled
                            ? () => {
                                const sectionSeats = Object.values(rows).flat();
                                sectionClick && sectionClick(sectionSeats);
                              }
                            : undefined
                        }
                        x={midX}
                        y={minY - 20} // adjust gap above row
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="currentColor"
                      >
                        {sectionName.replace(/_/g, " ").toUpperCase()}
                      </text>
                    );
                  })()}
                </g>
              ))}
              <g id="STAGE">
                <g id="Group 10">
                  <path id="Vector 4" d="M239 66L359 34H683.5L795.5 66" stroke="currentColor" />
                  <path id="Vector 5" d="M239.5 70L359.5 38H684L796 70" stroke="currentColor" />
                </g>
                <path
                  id="STAGE_2"
                  d="M479.556 15.112C478.735 15.112 477.999 14.9787 477.348 14.712C476.697 14.4453 476.175 14.0507 475.78 13.528C475.396 13.0053 475.193 12.376 475.172 11.64H478.084C478.127 12.056 478.271 12.376 478.516 12.6C478.761 12.8133 479.081 12.92 479.476 12.92C479.881 12.92 480.201 12.8293 480.436 12.648C480.671 12.456 480.788 12.1947 480.788 11.864C480.788 11.5867 480.692 11.3573 480.5 11.176C480.319 10.9947 480.089 10.8453 479.812 10.728C479.545 10.6107 479.161 10.4773 478.66 10.328C477.935 10.104 477.343 9.88 476.884 9.656C476.425 9.432 476.031 9.10133 475.7 8.664C475.369 8.22667 475.204 7.656 475.204 6.952C475.204 5.90667 475.583 5.09067 476.34 4.504C477.097 3.90667 478.084 3.608 479.3 3.608C480.537 3.608 481.535 3.90667 482.292 4.504C483.049 5.09067 483.455 5.912 483.508 6.968H480.548C480.527 6.60533 480.393 6.32267 480.148 6.12C479.903 5.90667 479.588 5.8 479.204 5.8C478.873 5.8 478.607 5.89067 478.404 6.072C478.201 6.24267 478.1 6.49333 478.1 6.824C478.1 7.18667 478.271 7.46933 478.612 7.672C478.953 7.87467 479.487 8.09333 480.212 8.328C480.937 8.57333 481.524 8.808 481.972 9.032C482.431 9.256 482.825 9.58133 483.156 10.008C483.487 10.4347 483.652 10.984 483.652 11.656C483.652 12.296 483.487 12.8773 483.156 13.4C482.836 13.9227 482.367 14.3387 481.748 14.648C481.129 14.9573 480.399 15.112 479.556 15.112ZM493.416 3.768V5.96H490.44V15H487.704V5.96H484.728V3.768H493.416ZM501.781 13.016H497.589L496.917 15H494.053L498.117 3.768H501.285L505.349 15H502.453L501.781 13.016ZM501.077 10.904L499.685 6.792L498.309 10.904H501.077ZM514.042 7.32C513.839 6.94667 513.546 6.664 513.162 6.472C512.788 6.26933 512.346 6.168 511.834 6.168C510.948 6.168 510.239 6.46133 509.706 7.048C509.172 7.624 508.906 8.39733 508.906 9.368C508.906 10.4027 509.183 11.2133 509.738 11.8C510.303 12.376 511.076 12.664 512.058 12.664C512.73 12.664 513.295 12.4933 513.754 12.152C514.223 11.8107 514.564 11.32 514.778 10.68H511.306V8.664H517.258V11.208C517.055 11.8907 516.708 12.5253 516.218 13.112C515.738 13.6987 515.124 14.1733 514.378 14.536C513.631 14.8987 512.788 15.08 511.85 15.08C510.74 15.08 509.748 14.84 508.874 14.36C508.01 13.8693 507.332 13.192 506.842 12.328C506.362 11.464 506.122 10.4773 506.122 9.368C506.122 8.25867 506.362 7.272 506.842 6.408C507.332 5.53333 508.01 4.856 508.874 4.376C509.738 3.88533 510.724 3.64 511.834 3.64C513.178 3.64 514.308 3.96533 515.226 4.616C516.154 5.26667 516.767 6.168 517.066 7.32H514.042ZM521.509 5.96V8.232H525.173V10.344H521.509V12.808H525.653V15H518.773V3.768H525.653V5.96H521.509Z"
                  fill="currentColor"
                />
              </g>

              <path
                id="Vector 6"
                d="M79 487.5L110.5 508L136 522.5L169.5 537.5L221.5 550L257.5 556.5L430 558.5H604L793 542.5L857.5 527.5L894 519.5L923 511L971 490.5"
                stroke="#BEBEBE"
                stroke-dasharray="4 4"
              />
              <path
                id="Vector 7"
                d="M76.5 508.5L103.5 529L137.5 548.5L167.5 561L193 568.5L223.5 574L256.5 577L426 575.5H599L796.5 559.5L896.5 538.5L913.5 533.5L946 519.5L978 505"
                stroke="#BEBEBE"
                stroke-dasharray="4 4"
              />
            </g>
          </svg>

          {hoveredSeat && (
            <div
              ref={tooltipRef}
              className="fixed z-20 bg-background shadow-lg rounded px-2 py-1 text-xs border border-gray-300"
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

import React, { useEffect, useRef, useState } from "react";
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
  showToggle?: boolean;
}

const SeatMap = ({
  showToggle = true,
  seatClick,
  rowClick,
  sectionClick,
  recStyle,
  seatMap,
  disabled = false,
  width = "100%",
  height = "100%",
}: Props) => {
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

  useEffect(() => {
    if (window.innerWidth < 640) setScale(2.5);
    else if (window.innerWidth < 1024) setScale(1.2);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

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
        {disabled && <div className="absolute top-16 left-2 z-10 flex space-x-2 p-2 border border-red bg-red/30 text-red font-bold">View Only</div>}

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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
              <g id="Room">
                <rect id="Rectangle 4294" x="385.372" y="668" width="170" height="67" fill="#D9D9D9" />
                <path
                  id="Control Room"
                  d="M437.451 700H436.394C436.332 699.696 436.222 699.429 436.066 699.199C435.913 698.969 435.725 698.776 435.504 698.619C435.285 698.46 435.042 698.341 434.775 698.261C434.508 698.182 434.23 698.142 433.94 698.142C433.411 698.142 432.933 698.276 432.504 698.543C432.078 698.81 431.738 699.203 431.485 699.723C431.235 700.243 431.11 700.881 431.11 701.636C431.11 702.392 431.235 703.03 431.485 703.55C431.738 704.07 432.078 704.463 432.504 704.73C432.933 704.997 433.411 705.131 433.94 705.131C434.23 705.131 434.508 705.091 434.775 705.011C435.042 704.932 435.285 704.814 435.504 704.658C435.725 704.499 435.913 704.304 436.066 704.074C436.222 703.841 436.332 703.574 436.394 703.273H437.451C437.372 703.719 437.227 704.118 437.017 704.47C436.806 704.822 436.545 705.122 436.232 705.369C435.92 705.614 435.569 705.8 435.18 705.928C434.794 706.055 434.38 706.119 433.94 706.119C433.196 706.119 432.534 705.938 431.954 705.574C431.374 705.21 430.919 704.693 430.586 704.023C430.254 703.352 430.088 702.557 430.088 701.636C430.088 700.716 430.254 699.92 430.586 699.25C430.919 698.58 431.374 698.062 431.954 697.699C432.534 697.335 433.196 697.153 433.94 697.153C434.38 697.153 434.794 697.217 435.18 697.345C435.569 697.473 435.92 697.661 436.232 697.908C436.545 698.152 436.806 698.45 437.017 698.803C437.227 699.152 437.372 699.551 437.451 700ZM441.682 706.136C441.091 706.136 440.572 705.996 440.126 705.714C439.683 705.433 439.336 705.04 439.086 704.534C438.839 704.028 438.716 703.437 438.716 702.761C438.716 702.08 438.839 701.484 439.086 700.976C439.336 700.467 439.683 700.072 440.126 699.791C440.572 699.51 441.091 699.369 441.682 699.369C442.273 699.369 442.79 699.51 443.233 699.791C443.679 700.072 444.025 700.467 444.273 700.976C444.523 701.484 444.648 702.08 444.648 702.761C444.648 703.437 444.523 704.028 444.273 704.534C444.025 705.04 443.679 705.433 443.233 705.714C442.79 705.996 442.273 706.136 441.682 706.136ZM441.682 705.233C442.131 705.233 442.5 705.118 442.79 704.888C443.079 704.658 443.294 704.355 443.433 703.98C443.572 703.605 443.642 703.199 443.642 702.761C443.642 702.324 443.572 701.916 443.433 701.538C443.294 701.161 443.079 700.855 442.79 700.622C442.5 700.389 442.131 700.273 441.682 700.273C441.233 700.273 440.863 700.389 440.574 700.622C440.284 700.855 440.069 701.161 439.93 701.538C439.791 701.916 439.721 702.324 439.721 702.761C439.721 703.199 439.791 703.605 439.93 703.98C440.069 704.355 440.284 704.658 440.574 704.888C440.863 705.118 441.233 705.233 441.682 705.233ZM447.188 702.062V706H446.183V699.455H447.154V700.477H447.24C447.393 700.145 447.626 699.878 447.938 699.676C448.251 699.472 448.654 699.369 449.149 699.369C449.592 699.369 449.98 699.46 450.312 699.642C450.644 699.821 450.903 700.094 451.088 700.46C451.272 700.824 451.365 701.284 451.365 701.841V706H450.359V701.909C450.359 701.395 450.225 700.994 449.958 700.707C449.691 700.418 449.325 700.273 448.859 700.273C448.538 700.273 448.251 700.342 447.998 700.482C447.748 700.621 447.551 700.824 447.406 701.091C447.261 701.358 447.188 701.682 447.188 702.062ZM456.049 699.455V700.307H452.657V699.455H456.049ZM453.645 697.886H454.651V704.125C454.651 704.409 454.692 704.622 454.775 704.764C454.86 704.903 454.968 704.997 455.099 705.045C455.232 705.091 455.373 705.114 455.52 705.114C455.631 705.114 455.722 705.108 455.793 705.097C455.864 705.082 455.921 705.071 455.964 705.062L456.168 705.966C456.1 705.991 456.005 706.017 455.883 706.043C455.76 706.071 455.606 706.085 455.418 706.085C455.134 706.085 454.856 706.024 454.583 705.902C454.313 705.78 454.089 705.594 453.91 705.344C453.734 705.094 453.645 704.778 453.645 704.398V697.886ZM457.562 706V699.455H458.533V700.443H458.601C458.721 700.119 458.937 699.857 459.249 699.655C459.562 699.453 459.914 699.352 460.306 699.352C460.38 699.352 460.472 699.354 460.583 699.357C460.694 699.359 460.778 699.364 460.834 699.369V700.392C460.8 700.384 460.722 700.371 460.6 700.354C460.481 700.334 460.354 700.324 460.221 700.324C459.903 700.324 459.618 700.391 459.368 700.524C459.121 700.655 458.925 700.837 458.78 701.07C458.638 701.3 458.567 701.562 458.567 701.858V706H457.562ZM464.486 706.136C463.895 706.136 463.377 705.996 462.931 705.714C462.488 705.433 462.141 705.04 461.891 704.534C461.644 704.028 461.52 703.437 461.52 702.761C461.52 702.08 461.644 701.484 461.891 700.976C462.141 700.467 462.488 700.072 462.931 699.791C463.377 699.51 463.895 699.369 464.486 699.369C465.077 699.369 465.594 699.51 466.037 699.791C466.484 700.072 466.83 700.467 467.077 700.976C467.327 701.484 467.452 702.08 467.452 702.761C467.452 703.437 467.327 704.028 467.077 704.534C466.83 705.04 466.484 705.433 466.037 705.714C465.594 705.996 465.077 706.136 464.486 706.136ZM464.486 705.233C464.935 705.233 465.305 705.118 465.594 704.888C465.884 704.658 466.099 704.355 466.238 703.98C466.377 703.605 466.447 703.199 466.447 702.761C466.447 702.324 466.377 701.916 466.238 701.538C466.099 701.161 465.884 700.855 465.594 700.622C465.305 700.389 464.935 700.273 464.486 700.273C464.037 700.273 463.668 700.389 463.378 700.622C463.089 700.855 462.874 701.161 462.735 701.538C462.596 701.916 462.526 702.324 462.526 702.761C462.526 703.199 462.596 703.605 462.735 703.98C462.874 704.355 463.089 704.658 463.378 704.888C463.668 705.118 464.037 705.233 464.486 705.233ZM469.993 697.273V706H468.987V697.273H469.993ZM475.346 706V697.273H478.295C478.977 697.273 479.537 697.389 479.974 697.622C480.412 697.852 480.736 698.169 480.946 698.572C481.156 698.976 481.261 699.435 481.261 699.949C481.261 700.463 481.156 700.919 480.946 701.317C480.736 701.714 480.413 702.027 479.979 702.254C479.544 702.479 478.988 702.591 478.312 702.591H475.926V701.636H478.278C478.744 701.636 479.119 701.568 479.403 701.432C479.69 701.295 479.898 701.102 480.025 700.852C480.156 700.599 480.221 700.298 480.221 699.949C480.221 699.599 480.156 699.294 480.025 699.033C479.895 698.771 479.686 698.57 479.399 698.428C479.112 698.283 478.733 698.21 478.261 698.21H476.403V706H475.346ZM479.454 702.08L481.602 706H480.375L478.261 702.08H479.454ZM485.475 706.136C484.884 706.136 484.365 705.996 483.919 705.714C483.476 705.433 483.129 705.04 482.879 704.534C482.632 704.028 482.509 703.437 482.509 702.761C482.509 702.08 482.632 701.484 482.879 700.976C483.129 700.467 483.476 700.072 483.919 699.791C484.365 699.51 484.884 699.369 485.475 699.369C486.066 699.369 486.583 699.51 487.026 699.791C487.472 700.072 487.818 700.467 488.066 700.976C488.316 701.484 488.441 702.08 488.441 702.761C488.441 703.437 488.316 704.028 488.066 704.534C487.818 705.04 487.472 705.433 487.026 705.714C486.583 705.996 486.066 706.136 485.475 706.136ZM485.475 705.233C485.923 705.233 486.293 705.118 486.583 704.888C486.872 704.658 487.087 704.355 487.226 703.98C487.365 703.605 487.435 703.199 487.435 702.761C487.435 702.324 487.365 701.916 487.226 701.538C487.087 701.161 486.872 700.855 486.583 700.622C486.293 700.389 485.923 700.273 485.475 700.273C485.026 700.273 484.656 700.389 484.367 700.622C484.077 700.855 483.862 701.161 483.723 701.538C483.584 701.916 483.514 702.324 483.514 702.761C483.514 703.199 483.584 703.605 483.723 703.98C483.862 704.355 484.077 704.658 484.367 704.888C484.656 705.118 485.026 705.233 485.475 705.233ZM492.635 706.136C492.044 706.136 491.525 705.996 491.079 705.714C490.636 705.433 490.29 705.04 490.04 704.534C489.792 704.028 489.669 703.437 489.669 702.761C489.669 702.08 489.792 701.484 490.04 700.976C490.29 700.467 490.636 700.072 491.079 699.791C491.525 699.51 492.044 699.369 492.635 699.369C493.226 699.369 493.743 699.51 494.186 699.791C494.632 700.072 494.979 700.467 495.226 700.976C495.476 701.484 495.601 702.08 495.601 702.761C495.601 703.437 495.476 704.028 495.226 704.534C494.979 705.04 494.632 705.433 494.186 705.714C493.743 705.996 493.226 706.136 492.635 706.136ZM492.635 705.233C493.084 705.233 493.453 705.118 493.743 704.888C494.033 704.658 494.247 704.355 494.386 703.98C494.525 703.605 494.595 703.199 494.595 702.761C494.595 702.324 494.525 701.916 494.386 701.538C494.247 701.161 494.033 700.855 493.743 700.622C493.453 700.389 493.084 700.273 492.635 700.273C492.186 700.273 491.817 700.389 491.527 700.622C491.237 700.855 491.023 701.161 490.883 701.538C490.744 701.916 490.675 702.324 490.675 702.761C490.675 703.199 490.744 703.605 490.883 703.98C491.023 704.355 491.237 704.658 491.527 704.888C491.817 705.118 492.186 705.233 492.635 705.233ZM497.136 706V699.455H498.107V700.477H498.193C498.329 700.128 498.549 699.857 498.853 699.663C499.157 699.467 499.522 699.369 499.948 699.369C500.38 699.369 500.74 699.467 501.026 699.663C501.316 699.857 501.542 700.128 501.704 700.477H501.772C501.94 700.139 502.191 699.871 502.526 699.672C502.862 699.47 503.264 699.369 503.732 699.369C504.318 699.369 504.796 699.553 505.169 699.919C505.541 700.283 505.727 700.849 505.727 701.619V706H504.721V701.619C504.721 701.136 504.589 700.791 504.325 700.584C504.061 700.376 503.749 700.273 503.392 700.273C502.931 700.273 502.575 700.412 502.322 700.69C502.069 700.966 501.943 701.315 501.943 701.739V706H500.92V701.517C500.92 701.145 500.799 700.845 500.558 700.618C500.316 700.388 500.005 700.273 499.624 700.273C499.363 700.273 499.119 700.342 498.892 700.482C498.667 700.621 498.485 700.814 498.346 701.061C498.21 701.305 498.142 701.588 498.142 701.909V706H497.136Z"
                  fill="black"
                />
              </g>
            </g>
          </svg>

          {hoveredSeat && showToggle && (
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

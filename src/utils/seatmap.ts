import type { FlattenedSeat, SeatMap } from "../types/seat";

export const flattenSeatMap = (seatMap: SeatMap): FlattenedSeat[] => {
  return Object.entries(seatMap).flatMap(([section, rows]) =>
    Object.entries(rows).flatMap(([row, seats]) =>
      seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        x: seat.x,
        y: seat.y,
        row,
        section,
        status: seat.status ?? "available",
        ticketControlNumber: seat.ticketControlNumber ?? 0,
        ticketPrice: seat.ticketPrice ?? 0,
        isComplimentary: false,
      }))
    )
  );
};

export const formatSectionName = (sectionName: string) => {
  return sectionName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

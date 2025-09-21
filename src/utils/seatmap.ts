import type { FlattenedSeat, SeatMetaData, SeatStatus } from "../types/seat";

export const flattenSeatMap = (seatMap: SeatMetaData[]): FlattenedSeat[] => {
  const flattened = seatMap.map((seat) => ({
    ...seat,
    section: camelCase(seat.section),
    isComplimentary: false,
    status: "available" as SeatStatus,
    ticketControlNumber: 0,
    ticketPrice: 0,
  }));

  return sortSeatsByRowAndNumber(flattened);
};

export const formatSectionName = (sectionName: string) => {
  return sectionName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

const camelCase = (text: string) => {
  return text.toLowerCase().replace(/[_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ""));
};

export const sortSeatsByRowAndNumber = (seats: FlattenedSeat[]) =>
  [...seats].sort((a, b) => {
    if (a.row.length !== b.row.length) return b.row.length - a.row.length;

    if (a.row !== b.row) return a.row.localeCompare(b.row, undefined, { numeric: true });

    const numA = parseInt((a.seatNumber.match(/\d+/) || ["0"])[0], 10);
    const numB = parseInt((b.seatNumber.match(/\d+/) || ["0"])[0], 10);
    return numA - numB;
  });

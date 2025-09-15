import type { FlattenedSeat, SeatMetaData } from "../types/seat";

export const flattenSeatMap = (seatMap: SeatMetaData[]): FlattenedSeat[] => {
  return seatMap.map((seat) => ({
    ...seat,
    section: camelCase(seat.section),
    isComplimentary: false,
    status: "available",
    ticketControlNumber: 0,
    ticketPrice: 0,
  }));
};

export const formatSectionName = (sectionName: string) => {
  return sectionName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

const camelCase = (text: string) => {
  return text.toLowerCase().replace(/[_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ""));
};

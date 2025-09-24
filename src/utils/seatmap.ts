import type { FlattenedSeat, SeatMetaData, SeatStatus } from "../types/seat";

export const flattenSeatMap = (seatMap: SeatMetaData[]): FlattenedSeat[] => {
  const flattened = seatMap.map((seat) => ({
    ...seat,
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

export const sortSeatsByRowAndNumber = (seats: FlattenedSeat[]) =>
  [...seats].sort((a, b) => {
    if (a.row.length !== b.row.length) return b.row.length - a.row.length;

    if (a.row !== b.row) return a.row.localeCompare(b.row, undefined, { numeric: true });

    const numA = parseInt((a.seatNumber.match(/\d+/) || ["0"])[0], 10);
    const numB = parseInt((b.seatNumber.match(/\d+/) || ["0"])[0], 10);
    return numA - numB;
  });

export const compressSeats = (seatNumbers: string[]): string[] => {
  const groups: Record<string, number[]> = {};

  seatNumbers.forEach((seat) => {
    const match = seat.match(/^([A-Z]+)(\d+)$/);
    if (!match) return;

    const [, row, num] = match;
    if (!groups[row]) groups[row] = [];
    groups[row].push(Number(num));
  });

  const compressed: string[] = [];

  for (const row of Object.keys(groups)) {
    const nums = groups[row].sort((a, b) => a - b);

    let start = nums[0];
    let prev = nums[0];

    for (let i = 1; i <= nums.length; i++) {
      if (nums[i] !== prev + 1) {
        if (start === prev) {
          compressed.push(`${row}${start}`);
        } else {
          compressed.push(`${row}${start}-${prev}`);
        }
        start = nums[i];
      }
      prev = nums[i];
    }
  }

  return compressed;
};

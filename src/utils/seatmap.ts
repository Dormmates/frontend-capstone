import type { FlattenedSeat, SeatMetaData, SeatStatus } from "../types/seat";

export const flattenSeatMap = (seatMap: SeatMetaData[]): FlattenedSeat[] => {
  const flattened = seatMap.map((seat) => ({
    ...seat,
    isComplimentary: false,
    status: "available" as SeatStatus,
    ticketControlNumber: 0,
    ticketPrice: 0,
  }));

  const sorted = sortSeatsByRowAndNumber(flattened);
  return sorted;
};

export const formatSectionName = (sectionName: string) => {
  return sectionName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRowLetters = (seatNumber: string) => seatNumber.match(/^[A-Z]+/i)?.[0] || "";

const getSeatNumber = (seatNumber: string) => parseInt(seatNumber.match(/\d+/)?.[0] || "0", 10);

export const sortSeatsByRowAndNumber = (seats: FlattenedSeat[]) => {
  return [...seats].sort((a, b) => {
    const rowA = getRowLetters(a.seatNumber);
    const rowB = getRowLetters(b.seatNumber);

    if (rowA !== rowB) {
      if (rowA.length !== rowB.length) return rowA.length - rowB.length;
      return rowA.localeCompare(rowB, undefined, { numeric: true });
    }

    return getSeatNumber(a.seatNumber) - getSeatNumber(b.seatNumber);
  });
};

export const sortSeatsByStartingRow = (seats: FlattenedSeat[], startRow: string) => {
  const sorted = sortSeatsByRowAndNumber(seats);
  const allRows = Array.from(new Set(sorted.map((s) => getRowLetters(s.seatNumber))));

  const startIndex = allRows.indexOf(startRow);
  if (startIndex === -1) return sorted;

  const orderedRows = [...allRows.slice(startIndex), ...allRows.slice(0, startIndex)];
  const rowOrder: Record<string, number> = {};
  orderedRows.forEach((r, i) => (rowOrder[r] = i));

  return [...sorted].sort((a, b) => {
    const rowA = getRowLetters(a.seatNumber);
    const rowB = getRowLetters(b.seatNumber);
    const rowDiff = (rowOrder[rowA] ?? 999) - (rowOrder[rowB] ?? 999);
    if (rowDiff !== 0) return rowDiff;
    return getSeatNumber(a.seatNumber) - getSeatNumber(b.seatNumber);
  });
};

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

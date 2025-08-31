export type SeatStatus = "reserved" | "vip" | "available" | "sold" | "complimentarySeat";
export type SeatSection = "orchestraLeft" | "orchestraRight" | "orchestraMiddle" | "balconyLeft" | "balconyRight" | "balconyMiddle";

export interface Seat {
  seatNumber: string;
  x: number;
  y: number;
  row?: string;
  section?: string;
  status?: SeatStatus;
  ticketControlNumber?: number;
  ticketPrice?: number;
}

export interface Row {
  [row: string]: Seat[];
}

export interface SeatMap {
  [section: string]: Row;
}

export interface FlattenedSeat {
  seatNumber: string;
  x: number;
  y: number;
  row: string;
  section: string;
  status: SeatStatus;
  ticketControlNumber: number;
  ticketPrice: number;
  isComplimentary: boolean;
  distributor?: {
    name: string;
    type: string;
    department: string;
  };
}

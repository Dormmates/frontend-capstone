export type SeatStatus = "reserved" | "vip" | "available" | "sold" | "complimentarySeat";
export type SeatSection = "orchestraLeft" | "orchestraRight" | "orchestraMiddle" | "balconyLeft" | "balconyRight" | "balconyMiddle";

export interface SeatMetaData {
  seatNumber: string;
  x: number;
  y: number;
  row: string;
  section: string;
  rotation: string | null;
}
export interface FlattenedSeat extends SeatMetaData {
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

import type { TicketStatuses } from "./ticket";

export type SeatStatus = "reserved" | "paidToCCA" | "available" | "sold" | "complimentarySeat";
export type SeatSection = "orchestraLeft" | "orchestraRight" | "orchestraMiddle" | "balconyLeft" | "balconyRight" | "balconyMiddle";

export interface SeatMetaData {
  seatNumber: string;
  x: number;
  y: number;
  row: string;
  section: SeatSection;
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
  ticketStatus?: TicketStatuses;
}

import type { FlattenedSeat } from "./seat";

export interface InputReservationData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
}

export interface ReservationData extends InputReservationData {
  scheduleId: string | undefined;
  selectedSeats: FlattenedSeat[];
}

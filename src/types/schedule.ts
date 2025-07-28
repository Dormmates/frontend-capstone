export type TicketType = "ticketed" | "nonTicketed";
export type SeatingConfiguration = "freeSeating" | "controlledSeating";
export type SeatPricing = "fixed" | "sectionedPricing";

export interface ScheduleDateTime {
  date: Date;
  time: string;
}

export interface ScheduleFormData {
  dates: ScheduleDateTime[];
  ticketType: TicketType;
  seatingConfiguration: SeatingConfiguration;
  seatPricing: SeatPricing;
  commissionFee: number | undefined;
  totalOrchestra: number | undefined;
  totalBalcony: number | undefined;
  totalComplimentary: number | undefined;
  orchestraControlNumber: string;
  balconyControlNumber: string;
  complimentaryControlNumber: string;
}

export type ErrorKeys =
  | "dates"
  | "commisionFee"
  | "totalOrchestra"
  | "orchestraControlNumber"
  | "totalBalcony"
  | "balconyControlNumber"
  | "totalComplimentary"
  | "complimentaryControlNumber"
  | "ticketPrice"
  | "orchestraLeft"
  | "orchestraMiddle"
  | "orchestraRight"
  | "balconyLeft"
  | "balconyMiddle"
  | "balconyRight";

export type ScheduleFormErrors = Partial<Record<ErrorKeys, string>>;

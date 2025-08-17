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

export interface ScheduleInformation {
  scheduleId: string;
  showId: string;
  seatingType: SeatingConfiguration;
  ticketType: TicketType;
  contactNumber: string | null;
  facebookLink: string | null;
  commissionFee: number;
  datetime: Date;
  isOpen: boolean | null;
  isArchived: boolean | null;
  isRescheduled: boolean | null;
  femaleCount: number | null;
  maleCount: number | null;
}

export interface ScheduleSummary {
  expectedSales: number;
  currentSales: number;
  remainingSales: number;
  totalTicket: number;
  totalOrchestra: number;
  totalBalcony: number;
  totalComplimentary: number;
  sold: number;
  notAllocated: number;
  unsold: number;
  pendingRemittance: number;
}

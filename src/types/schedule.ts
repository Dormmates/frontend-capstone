import type { Ticket } from "./ticket";
import type { TicketPricing } from "./ticketpricing";

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
  totalTickets?: number;
  totalComplimentary?: number;
  ticketsControlNumber: string;
  complimentaryControlNumber: string;
}

export type ErrorKeys =
  | "dates"
  | "commisionFee"
  | "totalTickets"
  | "ticketsControlNumber"
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

export interface Schedule {
  scheduleId: string;
  showId: string;
  seatingType: SeatingConfiguration;
  ticketType: TicketType;
  contactNumber: string | null;
  facebookLink: string | null;
  datetime: Date;
  isOpen: boolean;
  isRescheduled: boolean;
  femaleCount: number | null;
  maleCount: number | null;
  ticketPricing: TicketPricing;
}

export interface ScheduleWithTickets extends Schedule {
  tickets: Ticket[];
}

interface TicketBreakdown {
  total: number;
  sold: number;
  remaining: number;
  notAllocated: number;
  allocated: number;
  unremitted: number;
  remitted: number;
}

interface DistributorSummary {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAllocatedTickets: number;
  soldTickets: number;
  unsoldTickets: number;
  remittedTickets: number;
  pendingRemittance: number;
  expected: number;
  remitted: number;
  balanceDue: number;
}

export interface ScheduleSummary {
  ticketsSummary: {
    total: number;
    complimentary: number;
    regularTickets: TicketBreakdown;
  };
  distributorSummary: {
    distributors: DistributorSummary[];
    distributorsTotal: {
      allocated: number;
      sold: number;
      unsold: number;
      remitted: number;
    };
  };
  salesSummary: {
    expected: number;
    current: number;
    remaining: number;
    netAfterCommission: number;
  };
  schedulePrices: {
    ticketPrice?: number;
    ticketPricesBySection?: {
      orchestraMiddle: number;
      orchestraLeft: number;
      orchestraRight: number;
      balconyMiddle: number;
      balconyRight: number;
      balconyLeft: number;
    };
  };
}

export type SoldTicketActivity = {
  ticketId: string;
  controlNumber: string;
  customerName?: string;
  customerEmail?: string;
};

export type UnsoldActivity = {
  actionByDistributorId: string;
  controlNumber: string;
  previousCustomerEmail?: string;
  previousCustomerName?: string;
  ticketId: string;
};

export interface DistributorTicketActivities {
  actionDate: string;
  actionLogId: string;
  actionType: "soldTicket" | "unsoldTicket";
  distributor: {
    firstName: string;
    lastName: string;
    userId: string;
  };
  metaData: SoldTicketActivity[] | UnsoldActivity[];
}

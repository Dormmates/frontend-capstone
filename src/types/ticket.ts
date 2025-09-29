import type { SeatingConfiguration } from "./schedule";
import type { SeatSection } from "./seat";

type TicketStatuses = "sold" | "lost" | "not_allocated" | "allocated";
type TicketSection = "orchestra" | "balcony";

export interface Ticket {
  scheduleId: string;
  ticketPrice: number;
  isComplimentary: boolean;
  controlNumber: number;
  discountPercentage: number;
  status: TicketStatuses;
  ticketSection: TicketSection;
  ticketId: string;
  seatNumber: string | null;
  distributorId: string | null;
  isRemitted: boolean;
}

export interface AllocatedTicketToDistributor {
  ticketId: string;
  status: TicketStatuses;
  ticketPrice: number;
  seatNumber: string | null;
  ticketSection: string | null;
  seatSection: SeatSection | null;
  controlNumber: number;
  isRemitted: boolean;
  dateAllocated: Date;
  allocatedBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  distributor: string;
}

export interface AllocationHistory {
  showId: string;
  scheduleId: string;
  actionType: "allocate" | "unallocate";
  showCover: string;
  showTitle: string;
  showDate: Date;
  allocationLogId: string;
  allocatedBy: {
    firstName: string;
    lastName: string;
    userId: string;
  };
  distributor: {
    firstName: string;
    lastName: string;
    userId: string;
  };
  dateAllocated: Date;
  tickets: {
    ticketId: string;
    ticketPrice: string;
    controlNumber: number;
  }[];
}

export interface RemittanceHistory {
  showId: string;
  scheduleId: string;
  actionType: "remit" | "unremit";
  remittanceId: string;
  receivedBy: string;
  dateRemitted: Date;
  totalRemittance: number;
  totalCommission: number;
  remarks: string;
  discountPercentage: number;
  seatingType: SeatingConfiguration;
  showDate: Date;
  showCover: string;
  showTitle: string;
  tickets: {
    controlNumber: number;
    ticketPrice: number;
    status: TicketStatuses;
    discountPercentage?: number;
    seatSection: SeatSection | null;
  }[];
}

export interface DistributorScheduleTickets {
  scheduleId: string;
  datetime: Date;
  commissionFee: number;
  seatingType: SeatingConfiguration;
  show: {
    showCover: string;
    showId: string;
    title: string;
  };
  tickets: {
    ticketId: string;
    status: TicketStatuses;
    ticketPrice: number;
    controlNumber: number;
    seatNumber: string | null;
    ticketSection: TicketSection;
    isRemitted: boolean;
    dateAllocated: Date;
    allocatedBy: string;
  }[];
}

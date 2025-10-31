import type { SeatingConfiguration } from "./schedule";
import type { SeatSection } from "./seat";

export type TicketStatuses = "sold" | "lost" | "not_allocated" | "allocated" | "remitted" | "paidToCCA";
type TicketSection = "orchestra" | "balcony";

export interface Ticket {
  distributorName: string;
  distributorType: string;
  scheduleId: string;
  ticketPrice: number;
  isComplimentary: boolean;
  controlNumber: number;
  discountPercentage: number;
  status: TicketStatuses;
  seatSection: SeatSection;
  ticketId: string;
  seatNumber: string | null;
  distributorId: string | null;
  trainerSold: boolean;
  customerName: string | null;
  customerEmail: string | null;
  isPaid: boolean;
}

export interface AllocatedTicketToDistributor {
  ticketId: string;
  status: TicketStatuses;
  ticketPrice: number;
  seatNumber: string | null;
  ticketSection: string | null;
  seatSection: SeatSection | null;
  controlNumber: number;
  dateAllocated: Date;
  isPaid: boolean;
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
  actionType: "payToCCA" | "unPayToCCA";
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
    dateAllocated: Date;
    allocatedBy: string;
    isPaid: boolean;
  }[];
}

export interface TicketLog {
  logType: string;
  actionBy: string;
  logDate: string;
  distributorName: string;
  currentDistributor: string;
}

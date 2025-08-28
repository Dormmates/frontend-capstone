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
}

export interface AllocatedTicketToDistributor {
  ticketId: string;
  status: TicketStatuses;
  ticketPrice: number;
  seatNumber: string | null;
  ticketSection: string | null;
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
  actionType: "allocate" | "unallocate";
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
  remittanceId: string;
  receivedBy: string;
  dateRemitted: Date;
  totalRemittance: number;
  commission: number;
  remarks: string;
  tickets: {
    controlNumber: number;
    ticketPrice: number;
    status: TicketStatuses;
  }[];
}

export interface DistributorScheduleTickets {
  scheduleId: string;
  datetime: Date;
  commissionFee: number;
  seatingType: string;
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

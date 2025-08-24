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
  controlNumber: number;
  isRemitted: boolean;
  dateAllocated: Date;
  allocatedBy: {
    userId: string;
    firstName: string;
    lastName: string;
  };
  distributor: {
    userId: string;
    firstName: string;
    lastName: string;
  };
}

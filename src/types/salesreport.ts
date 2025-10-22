import type { Schedule } from "./schedule";

export type SalesReport = {
  showId: string;
  showTitle: string;
  schedules: ScheduleReport[];
  overallTotals: OverallTotals;
};

export type ScheduleReport = {
  schedule: Schedule;
  totalTickets: number;
  soldTickets: number;
  unsoldTickets: number;
  totalDiscount: number;
  ticketSales: number;
  totalCommission: number;
  netSales: number;
  salesBySection: SectionReport[];
  salesByDistributor: DistributorReport[];
};

export type SectionReport = {
  section: string;
  totalTickets: number;
  ticketsSold: number;
  totalSales: number;
  totalCommission: number;
  totalDiscount: number;
  discountBreakdown: {
    ticketControlNumbers: string[];
    discountPercentage: number;
    totalAmount: number;
  };
};

export type DistributorReport = {
  distributorType: string;
  distributorId: string;
  distributorName: string;
  ticketsSold: number;
  totalAmountRemitted: number;
  totalCommission: number;
};

export type OverallTotals = {
  totalTickets: number;
  soldTickets: number;
  unsoldTickets: number;
  totalDiscount: number;
  ticketSales: number;
  totalCommission: number;
  netSales: number;
};

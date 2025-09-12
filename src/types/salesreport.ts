export type SalesReport = {
  showId: string;
  showTitle: string;
  schedules: ScheduleReport[];
  overallTotals: OverallTotals;
};

export type ScheduleReport = {
  scheduleId: string;
  datetime: string; // ISO string
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
  ticketPrice: number | string; // can be string or number depending on DB
  ticketsSold: number;
  totalSales: number;
  totalDiscount: number;
  discountBreakdown: Record<
    string,
    {
      count: number;
      totalAmount: number;
    }
  >;
};

export type DistributorReport = {
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
  discountBreakdown: Record<
    string,
    {
      count: number;
      totalAmount: number;
    }
  >;
};

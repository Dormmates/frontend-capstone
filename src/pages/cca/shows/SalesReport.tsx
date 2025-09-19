import { useGenerateSalesReport } from "@/_lib/@react-client-query/show";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageWrapper, ContentWrapper } from "@/components/layout/Wrapper";
import { DataTable } from "@/components/DataTable";

const SalesReport = () => {
  const { showId, scheduleIds } = useParams<{ showId: string; scheduleIds: string }>();
  const scheduleIdsArray = scheduleIds ? scheduleIds.split(",") : [];
  const { data, isLoading, isError } = useGenerateSalesReport(showId as string, scheduleIdsArray);

  const ticketPriceData = data?.schedules.flatMap((sched) =>
    sched.salesBySection.map((sec) => ({
      datetime: sched.datetime,
      section: sec.section,
      ticketPrice: sec.ticketPrice,
    }))
  );

  const ticketPriceColumns = [
    {
      key: "date",
      header: "Schedule Date",
      render: (item: any) => formatToReadableDate(item.datetime),
    },
    {
      key: "time",
      header: "Schedule Time",
      render: (item: any) => formatToReadableTime(item.datetime),
    },
    {
      key: "section",
      header: "Section",
      render: (item: any) => item.section.toUpperCase(),
    },
    {
      key: "ticketPrice",
      header: "Ticket Price",
      render: (item: any) => "₱ " + item.ticketPrice,
    },
  ];

  const sectionSalesSummaryData = data?.schedules.flatMap((sched) =>
    sched.salesBySection.map((sec) => {
      const discountedTickets = Object.values(sec.discountBreakdown).reduce((acc: number, d: any) => acc + d.count, 0);
      const totalTickets = sec.ticketsSold + (sec.totalSales ? sec.ticketsSold : 0);
      const unsoldTickets = totalTickets - sec.ticketsSold;

      const commission = 0;
      const netSales = sec.totalSales - commission;

      return {
        datetime: sched.datetime,
        section: sec.section,
        totalTickets,
        ticketsSold: sec.ticketsSold,
        unsoldTickets,
        discountedTickets,
        totalDiscount: sec.totalDiscount,
        totalSales: sec.totalSales,
        commission,
        netSales,
      };
    })
  );

  const sectionSalesSummaryColumns = [
    {
      key: "date",
      header: "Schedule Date",
      render: (item: any) => new Date(item.datetime).toLocaleDateString(),
    },
    {
      key: "time",
      header: "Schedule Time",
      render: (item: any) => new Date(item.datetime).toLocaleTimeString(),
    },
    {
      key: "section",
      header: "Section",
      render: (item: any) => item.section.toUpperCase(),
    },
    {
      key: "totalTickets",
      header: "Total Tickets",
    },
    {
      key: "ticketsSold",
      header: "Sold Tickets",
    },
    {
      key: "unsoldTickets",
      header: "Unsold Tickets",
    },
    {
      key: "discountedTickets",
      header: "Discounted Tickets",
      render: (item: any) => "₱ " + item.discountedTickets,
    },
    {
      key: "totalDiscount",
      header: "Total Discount",
      render: (item: any) => "₱ " + item.discountedTickets,
    },
    {
      key: "totalSales",
      header: "Ticket Sales",
      render: (item: any) => "₱ " + item.totalSales,
    },
    {
      key: "commission",
      header: "Commission",
      render: (item: any) => "₱ " + item.commission,
    },
    {
      key: "netSales",
      header: "Net Sales",
      render: (item: any) => "₱ " + item.netSales,
    },
  ];

  const overallSalesSummaryData = [
    {
      totalTickets: data?.overallTotals.totalTickets,
      soldTickets: data?.overallTotals.soldTickets,
      unsoldTickets: data?.overallTotals.unsoldTickets,
      ticketSales: data?.overallTotals.ticketSales,
      totalCommission: data?.overallTotals.totalCommission,
      totalDiscount: data?.overallTotals.totalDiscount,
      netSales: data?.overallTotals.netSales,
    },
  ];

  const overallSalesSummaryColumns = [
    {
      key: "totalTickets",
      header: "Total Tickets",
    },
    {
      key: "soldTickets",
      header: "Sold Tickets",
    },
    {
      key: "unsoldTickets",
      header: "Unsold Tickets",
    },

    {
      key: "ticketSales",
      header: "Ticket Sales",
      render: (item: any) => "₱ " + item.ticketSales,
    },
    {
      key: "totalCommission",
      header: "Total Comission",
      render: (item: any) => "₱ " + item.totalCommission,
    },
    {
      key: "totalDiscount",
      header: "Total Discount",
      render: (item: any) => "₱ " + item.totalDiscount,
    },
    {
      key: "netSales",
      header: "Net Sales",
      render: (item: any) => "₱ " + item.netSales,
    },
  ];

  const distributorSalesData = data?.schedules
    .flatMap((s) => s.salesByDistributor)
    .map((d) => ({
      distributorId: d.distributorId,
      distributorName: d.distributorName,
      ticketsSold: d.ticketsSold,
      totalAmountRemitted: d.totalAmountRemitted,
      totalCommission: d.totalCommission,
    }));

  const distributorSalesColumn = [
    { key: "distributorName", header: "Distributor Name" },
    { key: "ticketsSold", header: "Tickets Sold" },
    {
      key: "totalAmountRemitted",
      header: "Total Amount Remitted",
      render: (item: any) => "₱ " + item.totalAmountRemitted,
    },
    { key: "totalCommission", header: "Total Commission", render: (item: any) => "₱ " + item.totalCommission },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load report</p>;
  if (!data) return <p>No data available</p>;

  return (
    <>
      <PageWrapper>
        <ContentWrapper className="flex flex-col gap-4 overflow-y-auto max-h-screen px-4">
          <header className="text-center">
            <h1 className="text-3xl font-bold">{data.showTitle}</h1>
            <h2 className="text-2xl font-semibold">Ticket Sales Report</h2>
          </header>

          <div>
            <h3 className="text-xl font-medium mb-1">Ticket Prices by Section</h3>
            <DataTable columns={ticketPriceColumns} data={ticketPriceData} />
          </div>

          <div>
            <h3 className="text-xl font-medium mb-1">Section Sales Summary</h3>
            <DataTable columns={sectionSalesSummaryColumns} data={sectionSalesSummaryData} />
          </div>

          <div>
            <h3 className="text-xl font-medium mb-1">Overall Sales Summary</h3>
            <DataTable columns={overallSalesSummaryColumns} data={overallSalesSummaryData} />
          </div>

          <div>
            <h3 className="text-xl font-medium mb-1">Distributor Sales Breakdown</h3>
            <DataTable columns={distributorSalesColumn} data={distributorSalesData} />
          </div>

          <div className="flex justify-between mb-10">
            <div className="flex flex-col gap-2">
              <span>Prepared By:</span>
              <span>______________________________________</span>
            </div>
            <div className="flex flex-col gap-2">
              <span>Noted By:</span>
              <span>______________________________________</span>
            </div>
          </div>

          <div className="flex justify-end gap-4 no-print">
            <Button className="w-[200px]" onClick={() => window.print()}>
              Export as PDF
            </Button>
            <Button className="w-[200px]" onClick={() => console.log("Export to Excel")}>
              Export as EXCEL
            </Button>
          </div>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
};

export default SalesReport;

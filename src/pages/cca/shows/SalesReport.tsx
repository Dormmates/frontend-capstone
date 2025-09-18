import { useGenerateSalesReport } from "@/_lib/@react-client-query/show";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SalesReport = () => {
  const { showId, scheduleIds } = useParams<{ showId: string; scheduleIds: string }>();
  const scheduleIdsArray = scheduleIds ? scheduleIds.split(",") : [];
  const { data, isLoading, isError } = useGenerateSalesReport(showId as string, scheduleIdsArray);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load report</p>;
  if (!data) return <p>No data available</p>;

  return (
    <>
      <Button className="no-print" onClick={() => window.print()}>
        Export as PDF
      </Button>
      {/* <Button onClick={exportToExcel}>Export as EXCEL</Button> */}
      <div id="sales-report">
        <header style={{ textAlign: "center" }}>
          <img src="/logo1.png" style={{ height: "50px", marginRight: "10px" }} />
          <img src="/logo2.png" style={{ height: "50px" }} />
          <h2>Ticket Sales Report</h2>
          <h3>{data.showTitle}</h3>
        </header>

        {/* 1️⃣ Ticket Prices Table */}
        <h3>Ticket Prices by Section</h3>
        <table>
          <thead>
            <tr>
              <th>Schedule Date</th>
              <th>Schedule Time</th>
              <th>Section</th>
              <th>Ticket Price</th>
            </tr>
          </thead>
          <tbody>
            {data.schedules.map((sched) =>
              sched.salesBySection.map((sec) => (
                <tr key={`${sched.scheduleId}-${sec.section}`}>
                  <td>{formatToReadableDate(sched.datetime)}</td>
                  <td>{formatToReadableTime(sched.datetime)}</td>
                  <td>{sec.section}</td>
                  <td>{sec.ticketPrice}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 2️⃣ Section Sales Summary Table */}
        <h3>Section Sales Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Schedule Date</th>
              <th>Schedule Time</th>
              <th>Section</th>
              <th>Total Tickets</th>
              <th>Sold Tickets</th>
              <th>Unsold Tickets</th>
              <th>Discounted Tickets</th>
              <th>Total Discount</th>
              <th>Ticket Sales</th>
              <th>Commission</th>
              <th>Net Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.schedules.map((sched) =>
              sched.salesBySection.map((sec) => {
                const discountedTickets = Object.values(sec.discountBreakdown).reduce((acc, d) => acc + d.count, 0);
                return (
                  <tr key={`${sched.scheduleId}-${sec.section}-summary`}>
                    <td>{new Date(sched.datetime).toLocaleDateString()}</td>
                    <td>{new Date(sched.datetime).toLocaleTimeString()}</td>
                    <td>{sec.section}</td>
                    <td>{sec.ticketsSold + (sec.totalSales ? sec.ticketsSold : 0)}</td>
                    <td>{sec.ticketsSold}</td>
                    <td>{sec.ticketsSold + (sec.totalSales ? sec.ticketsSold : 0) - sec.ticketsSold}</td>
                    <td>{discountedTickets}</td>
                    <td>{sec.totalDiscount}</td>
                    <td>{sec.totalSales}</td>
                    <td>{0}</td> {/* replace with actual commission if needed */}
                    <td>{sec.totalSales /* minus commission if needed */}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 3️⃣ Distributor Breakdown Table */}
        <h3>Distributor Sales Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Distributor Name</th>
              <th>Tickets Sold</th>
              <th>Total Amount Remitted</th>
              <th>Total Commission</th>
            </tr>
          </thead>
          <tbody>
            {data.schedules
              .flatMap((s) => s.salesByDistributor)
              .map((d) => (
                <tr key={d.distributorId}>
                  <td>{d.distributorName}</td>
                  <td>{d.ticketsSold}</td>
                  <td>{d.totalAmountRemitted}</td>
                  <td>{d.totalCommission}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <div>Prepared by:</div>
          <div>Noted by:</div>
        </div>
      </div>
    </>
  );
};

export default SalesReport;

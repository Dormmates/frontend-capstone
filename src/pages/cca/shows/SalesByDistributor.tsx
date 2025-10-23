import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SalesReport, DistributorReport, ScheduleReport } from "@/types/salesreport";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatCurrency } from "@/utils";
import { distributorTypeOptions } from "@/types/user";

interface Props {
  report: SalesReport;
}

const SalesByDistributor = ({ report }: Props) => {
  const schedulesByDate = report.schedules.reduce((acc, sched) => {
    const dateStr = formatToReadableDate(sched.schedule.datetime + "");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(sched);
    return acc;
  }, {} as Record<string, ScheduleReport[]>);

  return (
    <Table className="text-black ">
      <TableHeader className="bg-grey/20">
        <TableRow>
          <TableHead className="border border-gray-400 font-bold text-black">Date</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Time</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Distributor Name</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Distributor Type</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Tickets Sold</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Total Remitted</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Commission</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Object.entries(schedulesByDate).map(([date, schedules]) => {
          let renderedDateCell = false;

          return schedules.map((sched) => {
            const distributors = sched.salesByDistributor.filter((d) => d.ticketsSold > 0);
            const timeRowSpan = distributors.length || 1;

            return distributors.map((d: DistributorReport, distIndex: number) => {
              return (
                <TableRow className="border border-gray-400" key={`${sched.schedule.scheduleId}-${d.distributorId}`}>
                  {!renderedDateCell && (
                    <TableCell
                      className="border border-gray-400 align-top"
                      rowSpan={schedules.reduce((acc, s) => acc + (s.salesByDistributor.filter((d) => d.ticketsSold > 0).length || 1), 0)}
                    >
                      {date}
                    </TableCell>
                  )}
                  {(renderedDateCell = true)}

                  {/* Merge time cell */}
                  {distIndex === 0 && (
                    <TableCell className="border border-gray-400 align-top" rowSpan={timeRowSpan}>
                      {formatToReadableTime(sched.schedule.datetime + "")}
                    </TableCell>
                  )}

                  {/* Distributor row */}
                  <TableCell className="border border-gray-400">{d.distributorName}</TableCell>
                  <TableCell className="border border-gray-400">
                    {distributorTypeOptions.find((t) => t.value === d.distributorType)?.name ?? "Trainer"}
                  </TableCell>
                  <TableCell className="border border-gray-400">{d.ticketsSold}</TableCell>
                  <TableCell className="border border-gray-400">{formatCurrency(d.totalAmountRemitted)}</TableCell>
                  <TableCell className="border border-gray-400">{formatCurrency(d.totalCommission)}</TableCell>
                </TableRow>
              );
            });
          });
        })}

        {/* Totals Row */}
        <TableRow className="font-bold bg-muted/50">
          <TableCell className="border border-gray-400" colSpan={4}>
            Overall Totals
          </TableCell>
          <TableCell className="border border-gray-400">
            {report.schedules.reduce((acc, s) => acc + s.salesByDistributor.reduce((sum, d) => sum + d.ticketsSold, 0), 0)}
          </TableCell>
          <TableCell className="border border-gray-400">
            {formatCurrency(report.schedules.reduce((acc, s) => acc + s.salesByDistributor.reduce((sum, d) => sum + d.totalAmountRemitted, 0), 0))}
          </TableCell>
          <TableCell className="border border-gray-400">
            {formatCurrency(report.schedules.reduce((acc, s) => acc + s.salesByDistributor.reduce((sum, d) => sum + d.totalCommission, 0), 0))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default SalesByDistributor;

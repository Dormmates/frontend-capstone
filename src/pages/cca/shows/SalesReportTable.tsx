import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SalesReport, ScheduleReport, SectionReport } from "@/types/salesreport";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { formatCurrency } from "@/utils";

interface Props {
  report: SalesReport;
}

const formatSectionName = (section: string): string => {
  return section.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
};

export const SalesReportTable = ({ report }: Props) => {
  return (
    <Table className="text-black">
      <TableHeader>
        <TableRow className="bg-grey/20">
          <TableHead className="border border-gray-400 font-bold text-black">Date</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black">Time</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Section</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Total Tickets</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Sold</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Unsold</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Total Sales</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Discounts</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Commission</TableHead>
          <TableHead className="border border-gray-400 font-bold text-black ">Net Sales</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {report.schedules.map((s: ScheduleReport) => {
          const sectionRows = s.schedule.seatingType === "controlledSeating" ? s.salesBySection : [];
          const date = formatToReadableDate(s.schedule.datetime + "");
          const time = formatToReadableTime(s.schedule.datetime + "");

          if (s.schedule.seatingType === "freeSeating") {
            return (
              <TableRow key={s.schedule.scheduleId} className="border border-gray-400">
                <TableCell className="border border-gray-400">{date}</TableCell>
                <TableCell className="border border-gray-400">{time}</TableCell>
                <TableCell className="border border-gray-400">General Seats</TableCell>
                <TableCell className="border border-gray-400">{s.totalTickets}</TableCell>
                <TableCell className="border border-gray-400">{s.soldTickets}</TableCell>
                <TableCell className="border border-gray-400">{s.unsoldTickets}</TableCell>
                <TableCell className="border border-gray-400">{formatCurrency(s.ticketSales)}</TableCell>
                <TableCell className="border border-gray-400">{formatCurrency(s.totalDiscount)}</TableCell>
                <TableCell className="border border-gray-400">{formatCurrency(s.totalCommission)}</TableCell>
                <TableCell className="border border-gray-400">{formatCurrency(s.netSales)}</TableCell>
              </TableRow>
            );
          }

          let renderedDateCell = false;
          return sectionRows.map((sec: SectionReport, secIndex: number) => {
            const showDateCell = !renderedDateCell && secIndex === 0;
            renderedDateCell = true;
            const showTimeCell = secIndex === 0;

            return (
              <React.Fragment key={`${s.schedule.scheduleId}-${sec.section}`}>
                <TableRow className="border border-gray-400">
                  {showDateCell && (
                    <TableCell rowSpan={sectionRows.length + 1} className="border border-gray-400 align-top">
                      {date}
                    </TableCell>
                  )}
                  {showTimeCell && (
                    <TableCell rowSpan={sectionRows.length + 1} className="border border-gray-400 align-top">
                      {time}
                    </TableCell>
                  )}
                  <TableCell className="border border-gray-400">{formatSectionName(sec.section)}</TableCell>
                  <TableCell className="border border-gray-400">{sec.totalTickets}</TableCell>
                  <TableCell className="border border-gray-400">{sec.ticketsSold}</TableCell>
                  <TableCell className="border border-gray-400">{sec.totalTickets - sec.ticketsSold}</TableCell>
                  <TableCell className="border border-gray-400">{formatCurrency(sec.totalSales)}</TableCell>
                  <TableCell className="border border-gray-400">{formatCurrency(sec.totalDiscount)}</TableCell>
                  <TableCell className="border border-gray-400">{formatCurrency(sec.totalCommission)}</TableCell>
                  <TableCell className="border border-gray-400">
                    {formatCurrency(sec.totalSales - (sec.totalDiscount + sec.totalCommission))}
                  </TableCell>
                </TableRow>

                {/* Add summary row AFTER last section */}
                {secIndex === sectionRows.length - 1 && (
                  <TableRow className="bg-gray-100 font-semibold border border-gray-400">
                    <TableCell className="border border-gray-400">Summary</TableCell>
                    <TableCell className="border border-gray-400">{s.totalTickets}</TableCell>
                    <TableCell className="border border-gray-400">{s.soldTickets}</TableCell>
                    <TableCell className="border border-gray-400">{s.unsoldTickets}</TableCell>
                    <TableCell className="border border-gray-400">{formatCurrency(s.ticketSales)}</TableCell>
                    <TableCell className="border border-gray-400">{formatCurrency(s.totalDiscount)}</TableCell>
                    <TableCell className="border border-gray-400">{formatCurrency(s.totalCommission)}</TableCell>
                    <TableCell className="border border-gray-400">{formatCurrency(s.netSales)}</TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          });
        })}

        <TableRow className="font-bold bg-muted border border-gray-400">
          <TableCell colSpan={3} className="border border-gray-400">
            Overall Totals
          </TableCell>
          <TableCell className="border border-gray-400">{report.overallTotals.totalTickets}</TableCell>
          <TableCell className="border border-gray-400">{report.overallTotals.soldTickets}</TableCell>
          <TableCell className="border border-gray-400">{report.overallTotals.unsoldTickets}</TableCell>
          <TableCell className="border border-gray-400">{formatCurrency(report.overallTotals.ticketSales)}</TableCell>
          <TableCell className="border border-gray-400">{formatCurrency(report.overallTotals.totalDiscount)}</TableCell>
          <TableCell className="border border-gray-400">{formatCurrency(report.overallTotals.totalCommission)}</TableCell>
          <TableCell className="border border-gray-400">{formatCurrency(report.overallTotals.netSales)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

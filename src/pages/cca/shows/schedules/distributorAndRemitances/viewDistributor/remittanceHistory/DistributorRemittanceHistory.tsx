import { useOutletContext, useParams } from "react-router-dom";
import { useGetDistributorRemittanceHistory } from "@/_lib/@react-client-query/schedule.ts";
import { useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import type { Schedule } from "@/types/schedule.ts";
import { formatCurrency } from "@/utils";
import type { RemittanceHistory } from "@/types/ticket.ts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaginatedTable from "@/components/PaginatedTable";
import RemittanceSummary from "../distributorActions/RemittanceSummary";

const DistributorRemittanceHistory = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId, distributorId } = useParams();
  const { data, isLoading, isError } = useGetDistributorRemittanceHistory(distributorId as string, scheduleId as string);

  const [selectedHistory, setSelectedHistory] = useState<RemittanceHistory | null>(null);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error loading</h1>;
  }

  return (
    <>
      <PaginatedTable
        data={data}
        columns={[
          {
            key: "total",
            header: "Total Tickets Remitted",
            render: (log) => log.tickets.length,
          },
          {
            key: "date",
            header: "Date Remitted",
            render: (log) => formatToReadableDate(log.dateRemitted + ""),
          },
          {
            key: "time",
            header: "Time Remitted",
            render: (log) => formatToReadableTime(log.dateRemitted + ""),
          },
          {
            key: "to",
            header: "Remitted To",
            render: (log) => log.receivedBy,
          },
          {
            key: "amount",
            header: "Amount Remitted",
            render: (log) =>
              formatCurrency(log.tickets.reduce((acc, cur) => (acc += Number(cur.ticketPrice) - schedule.ticketPricing.commisionFee), 0)),
          },
          {
            key: "type",
            header: "Remittance Type",
            render: (log) =>
              log.actionType === "remit" ? (
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green rounded-full"></span>Remit
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red rounded-full"></span>Unremit
                </p>
              ),
          },
          {
            key: "action",
            header: "Action",
            render: (log) => (
              <Button onClick={() => setSelectedHistory(log)} variant="outline">
                View Summary
              </Button>
            ),
          },
        ]}
      />

      {selectedHistory && (
        <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remittance Summary</DialogTitle>
            </DialogHeader>
            <RemittanceSummary
              seatingType={schedule.seatingType}
              remarksValue={selectedHistory.remarks}
              discountPercentage={selectedHistory.tickets.find((t) => t.discountPercentage)?.discountPercentage}
              commissionFee={schedule.ticketPricing.commisionFee}
              discountedTickets={selectedHistory.tickets
                .filter((t) => t.discountPercentage)
                .map((t) => ({ ticketPrice: t.ticketPrice, controlNumber: t.controlNumber, seatSection: t.seatSection }))}
              lostTickets={selectedHistory.tickets
                .filter((t) => t.status === "lost")
                .map((t) => ({ ticketPrice: t.ticketPrice, controlNumber: t.controlNumber, seatSection: t.seatSection }))}
              soldTickets={selectedHistory.tickets.map((t) => ({
                ticketPrice: t.ticketPrice,
                controlNumber: t.controlNumber,
                seatSection: t.seatSection,
              }))}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DistributorRemittanceHistory;

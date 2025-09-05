import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useState } from "react";
import RemittanceSummary from "../../shows/schedules/distributorAndRemitances/viewDistributor/distributorActions/RemittanceSummary";
import { formatCurrency } from "@/utils";
import type { RemittanceHistory } from "@/types/ticket";

const DistributorRemittanceHistory = ({ remittanceHistory }: { remittanceHistory: RemittanceHistory[] }) => {
  const [selectedHistory, setSelectedHistory] = useState<RemittanceHistory | null>(null);

  return (
    <>
      <PaginatedTable
        data={remittanceHistory}
        columns={[
          {
            key: "show",
            header: "Show",
            render: (log) => (
              <div className="flex flex-col lg:flex-row items-center gap-2">
                <img className="w-5" src={log.showCover} alt="cover" />
                <p>{log.showTitle}</p>
              </div>
            ),
          },
          {
            key: "showSchedule",
            header: "Show Schedule",
            render: (log) => `${formatToReadableDate(log.showDate + "")} at ${formatToReadableTime(log.showDate + "")}`,
          },
          { key: "tickets", header: "Tickets Remitted", render: (log) => log.tickets.length },
          { key: "dateRemitted", header: "Date Remitted", render: (log) => formatToReadableDate(log.dateRemitted + "") },
          { key: "timeRemitted", header: "Time Remitted", render: (log) => formatToReadableTime(log.dateRemitted + "") },
          { key: "receivedBy", header: "Remitted To", render: (log) => log.receivedBy },
          { key: "amount", header: "Amount Remitted", render: (log) => formatCurrency(log.totalRemittance) },
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
        <Modal title="Remittance Summary" isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)}>
          <RemittanceSummary
            seatingType={selectedHistory.seatingType}
            remarksValue={selectedHistory.remarks}
            discountPercentage={selectedHistory.tickets.find((t) => t.discountPercentage)?.discountPercentage}
            commissionFee={selectedHistory.totalCommission / selectedHistory.tickets.length}
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
        </Modal>
      )}
    </>
  );
};

export default DistributorRemittanceHistory;

import { useMemo, useState } from "react";
import type { RemittanceHistory } from "../../../types/ticket";
import { useOutletContext } from "react-router-dom";
import RemittanceSummary from "../../cca/shows/schedules/distributorAndRemitances/remitTicket/RemittanceSummary";
import Modal from "../../../components/ui/Modal";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";
import { formatCurrency } from "../../../utils";
import Button from "../../../components/ui/Button";

const ITEMS_PER_PAGE = 5;

const DistributorCompleteRemittanceHistory = () => {
  const { remittanceHistory } = useOutletContext<{ remittanceHistory: RemittanceHistory[] }>();
  const [page, setPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<RemittanceHistory | null>(null);

  const paginatedLogs = useMemo(() => {
    if (!remittanceHistory) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return remittanceHistory.slice(start, end);
  }, [page, remittanceHistory]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Show</TableHead>
            <TableHead>Show Schedule</TableHead>
            <TableHead>Tickets Remitted</TableHead>
            <TableHead>Date Remitted</TableHead>
            <TableHead>Time Remitted</TableHead>
            <TableHead>Remitted To</TableHead>
            <TableHead>Amount Remitted</TableHead>
            <TableHead>Remittance Type</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {remittanceHistory.length == 0 ? (
            <TableRow>
              <TableCell className="text-center py-10 text-gray-400" colSpan={6}>
                No Remittance Yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow key={log.remittanceId}>
                <TableCell>
                  <div className="flex flex-col lg:flex-row items-center gap-2">
                    <img className="w-5" src={log.showCover} alt="cover" />
                    <p>{log.showTitle}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {formatToReadableDate(log.showDate + "")} at {formatToReadableTime(log.showDate + "")}
                </TableCell>
                <TableCell>{log.tickets.length}</TableCell>
                <TableCell>{formatToReadableDate(log.dateRemitted + "")}</TableCell>
                <TableCell>{formatToReadableTime(log.dateRemitted + "")}</TableCell>
                <TableCell>{log.receivedBy}</TableCell>
                <TableCell>{formatCurrency(log.totalRemittance)}</TableCell>
                <TableCell>
                  {log.actionType === "remit" ? (
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green rounded-full"></span>Remit
                    </p>
                  ) : (
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red rounded-full"></span>Unremit
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedHistory(log)} className="!bg-gray !text-black !border-lightGrey border-2">
                    View Summary
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {remittanceHistory.length !== 0 && (
        <div className="mt-5">
          <Pagination
            currentPage={page}
            totalPage={Math.ceil(remittanceHistory.length / ITEMS_PER_PAGE)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {selectedHistory && (
        <Modal isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)} title="Remittance Summary">
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

export default DistributorCompleteRemittanceHistory;

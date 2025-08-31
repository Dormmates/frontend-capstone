import { useOutletContext, useParams } from "react-router-dom";
import { useGetDistributorRemittanceHistory } from "../../../../../../../_lib/@react-client-query/schedule";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/table";
import { useMemo, useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "../../../../../../../utils/date";

import type { Schedule } from "../../../../../../../types/schedule";
import { formatCurrency } from "../../../../../../../utils";
import type { RemittanceHistory } from "../../../../../../../types/ticket";

import RemittanceSummary from "../../remitTicket/RemittanceSummary";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 5;

const DistributorRemittanceHistory = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId, distributorId } = useParams();
  const { data, isLoading, isError } = useGetDistributorRemittanceHistory(distributorId as string, scheduleId as string);

  const [page, setPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<RemittanceHistory | null>(null);

  const paginatedLogs = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return data.slice(start, end);
  }, [page, data]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error loading</h1>;
  }

  console.log(data);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Total Tickets Remitted</TableHead>
            <TableHead>Date Remitted</TableHead>
            <TableHead>Time Remitted</TableHead>
            <TableHead>Remitted To</TableHead>
            <TableHead>Amount Remitted</TableHead>
            <TableHead>Remittance Type</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length == 0 ? (
            <TableRow>
              <TableCell className="text-center py-10 text-gray-400" colSpan={6}>
                No Remittance Yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow key={log.remittanceId}>
                <TableCell>{log.tickets.length}</TableCell>
                <TableCell>{formatToReadableDate(log.dateRemitted + "")}</TableCell>
                <TableCell>{formatToReadableTime(log.dateRemitted + "")}</TableCell>
                <TableCell>{log.receivedBy}</TableCell>
                <TableCell>
                  {formatCurrency(log.tickets.reduce((acc, cur) => (acc += Number(cur.ticketPrice) - schedule.commissionFee), 0))}
                </TableCell>
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
                  <Button onClick={() => setSelectedHistory(log)} variant="outline">
                    View Summary
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="mt-5">
        <Pagination currentPage={page} totalPage={Math.ceil(data.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
      </div>

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
              commissionFee={schedule.commissionFee}
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

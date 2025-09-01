import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { AllocationHistory } from "@/types/ticket.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";

import LongCard from "../../../components/LongCard";
import LongCardItem from "../../../components/LongCardItem";

import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 5;

const DistributorCompleteAllocationHistory = () => {
  const { allocationHistory } = useOutletContext<{ allocationHistory: AllocationHistory[] }>();

  const [selectedHistory, setSelectedHistory] = useState<AllocationHistory | null>(null);
  const [page, setPage] = useState(1);

  const paginatedLogs = useMemo(() => {
    if (!allocationHistory) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return allocationHistory.slice(start, end);
  }, [page, allocationHistory]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Show</TableHead>
            <TableHead>Show Schedule</TableHead>
            <TableHead>Total Tickets</TableHead>
            <TableHead>Allocation Date</TableHead>
            <TableHead>Allocation Time</TableHead>
            <TableHead>Allocation By</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLogs.length == 0 ? (
            <TableRow>
              <TableCell className="text-center py-10 text-gray-400" colSpan={5}>
                No History found
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow key={log.allocationLogId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img className="w-5" src={log.showCover} alt="cover" />
                    <p>{log.showTitle}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {formatToReadableDate(log.showDate + "")} at {formatToReadableTime(log.showDate + "")}
                </TableCell>
                <TableCell>{log.tickets.length}</TableCell>
                <TableCell>{formatToReadableDate(log.dateAllocated + "")}</TableCell>
                <TableCell>{formatToReadableTime(log.dateAllocated + "")}</TableCell>
                <TableCell>{log.allocatedBy.firstName + " " + log.allocatedBy.lastName}</TableCell>
                <TableCell>
                  {log.actionType == "allocate" ? (
                    <div className="flex gap-2 items-center">
                      <span className="w-3 h-3 rounded-full !bg-green"></span>Allocate
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <span className="w-3 h-3 rounded-full !bg-red"></span>Unallocate
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedHistory(log)} variant="outline">
                    View Tickets
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-5">
        <Pagination
          currentPage={page}
          totalPage={Math.ceil(allocationHistory.length / ITEMS_PER_PAGE)}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {selectedHistory && (
        <Modal className="max-w-3xl" title="Allocation Summary" isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)}>
          <div className="mb-5">
            <LongCard label="Tickets">
              <LongCardItem
                label={selectedHistory.actionType === "allocate" ? "Total Tickets Allocated" : "Total Tickets Unallocated"}
                value={selectedHistory.tickets.length}
              />
              <LongCardItem
                label={selectedHistory.actionType === "allocate" ? "Date Allocated" : "Date Unallocated"}
                value={formatToReadableDate(selectedHistory.dateAllocated + "")}
              />
              <LongCardItem
                label={selectedHistory.actionType === "allocate" ? "Time Allocated" : "Time Unallocated"}
                value={formatToReadableTime(selectedHistory.dateAllocated + "")}
              />
              <LongCardItem
                label={selectedHistory.actionType === "allocate" ? "Allocated by" : "Unallocated by"}
                value={selectedHistory.allocatedBy.firstName + " " + selectedHistory.allocatedBy.lastName}
              />
            </LongCard>
          </div>
          <InputField
            onChange={(e) => e}
            disabled={true}
            label={selectedHistory.actionType === "allocate" ? "Ticket Control Numbers Allocated" : "Ticket Control Numbers Unallocated"}
            value={compressControlNumbers(selectedHistory.tickets.map((ticket) => ticket.controlNumber))}
          />
        </Modal>
      )}
    </>
  );
};

export default DistributorCompleteAllocationHistory;

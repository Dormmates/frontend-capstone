import { useParams } from "react-router-dom";
import { useGetDistributorAllocationHistory } from "@/_lib/@react-client-query/schedule.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { useMemo, useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";

import type { AllocationHistory } from "@/types/ticket.ts";

import LongCard from "../../../../../../../components/LongCard";
import LongCardItem from "../../../../../../../components/LongCardItem";

import { compressControlNumbers } from "@/utils/controlNumber.ts";
import { Button } from "@/components/ui/button";

import InputField from "@/components/InputField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 5;

const DistributorAllocationHistory = () => {
  const { scheduleId, distributorId } = useParams();
  const { data, isLoading, isError } = useGetDistributorAllocationHistory(distributorId as string, scheduleId as string);

  const [selectedHistory, setSelectedHistory] = useState<AllocationHistory | null>(null);

  const [page, setPage] = useState(1);

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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Total Tickets</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Action By</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length == 0 ? (
            <TableRow>
              <TableCell className="text-center py-10 text-gray-400" colSpan={5}>
                No History found
              </TableCell>
            </TableRow>
          ) : (
            paginatedLogs.map((log) => (
              <TableRow key={log.allocationLogId}>
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
        <Pagination currentPage={page} totalPage={Math.ceil(data.length / ITEMS_PER_PAGE)} onPageChange={(newPage) => setPage(newPage)} />
      </div>

      {selectedHistory && (
        <Dialog open={!!selectedHistory} onOpenChange={() => setSelectedHistory(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tickets Allocated</DialogTitle>
            </DialogHeader>
            <div className="my-5">
              <LongCard className="w-full" label="Tickets">
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
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DistributorAllocationHistory;

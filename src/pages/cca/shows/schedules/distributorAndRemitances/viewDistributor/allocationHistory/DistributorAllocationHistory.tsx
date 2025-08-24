import { useParams } from "react-router-dom";
import { useGetDistributorAllocationHistory } from "../../../../../../../_lib/@react-client-query/schedule";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/Table";
import { useMemo, useState } from "react";
import { formatToReadableDate, formatToReadableTime } from "../../../../../../../utils/date";
import Button from "../../../../../../../components/ui/Button";
import type { AllocationHistory } from "../../../../../../../types/ticket";
import Modal from "../../../../../../../components/ui/Modal";
import LongCard from "../../../../../../../components/ui/LongCard";
import LongCardItem from "../../../../../../../components/ui/LongCardItem";
import TextInput from "../../../../../../../components/ui/TextInput";

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
            <TableHead>Total Tickets Allocated</TableHead>
            <TableHead>Date Allocated</TableHead>
            <TableHead>Time Allocated</TableHead>
            <TableHead>Allocated By</TableHead>
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
                  <Button onClick={() => setSelectedHistory(log)} className="!bg-gray !text-black !border-lightGrey border-2">
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
        <Modal title="Tickets Allocated" isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)}>
          <div className="my-5">
            <LongCard label="Tickets">
              <LongCardItem label="Total Tickets Allocated" value={selectedHistory.tickets.length} />
              <LongCardItem label="Date Allocated" value={formatToReadableDate(selectedHistory.dateAllocated + "")} />
              <LongCardItem label="Time Allocated" value={formatToReadableTime(selectedHistory.dateAllocated + "")} />
              <LongCardItem label="Allocated By" value={selectedHistory.allocatedBy.firstName + " " + selectedHistory.allocatedBy.lastName} />
            </LongCard>
          </div>
          <TextInput
            onChange={(e) => e}
            disabled={true}
            label="Ticket Control Numbers Allocated"
            value={selectedHistory.tickets.map((ticket) => ticket.controlNumber).join(", ")}
          />
        </Modal>
      )}
    </>
  );
};

export default DistributorAllocationHistory;

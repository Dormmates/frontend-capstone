import { useOutletContext } from "react-router-dom";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import LongCard from "../../../../../../../components/LongCard";
import LongCardItem from "../../../../../../../components/LongCardItem";
import type { Schedule } from "@/types/schedule.ts";
import { formatTicket } from "@/utils/controlNumber.ts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Pagination from "@/components/Pagination";
import Dropdown from "@/components/Dropdown";

const ITEMS_PER_PAGE = 5;

const verificationOptions = [
  { name: "All Verification Status", value: "all" },
  { name: "Verified", value: "verified" },
  { name: "Pending", value: "pending" },
];

const saleOptions = [
  { name: "All Sale Status", value: "all" },
  { name: "Sold", value: "sold" },
  { name: "Unsold", value: "unsold" },
];

const DistributorTicketsAllocated = () => {
  const { allocatedTickets } = useOutletContext<{ allocatedTickets: AllocatedTicketToDistributor[] }>();
  const { schedule } = useOutletContext<{ schedule: Schedule }>();

  const [selectedTicket, setSelectedTicket] = useState<AllocatedTicketToDistributor | null>(null);

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ search: "", saleStatus: "", verificationStatus: "" });
  const debouncedSearch = useDebounce(filter.search);

  const filteredTickets = useMemo(() => {
    return allocatedTickets.filter((ticket) => {
      const matchesSearch = !debouncedSearch || ticket.controlNumber?.toString().includes(debouncedSearch);
      const matchesSale =
        !filter.saleStatus ||
        filter.saleStatus == "all" ||
        (filter.saleStatus === "sold" ? ticket.isRemitted || ticket.status === "sold" : !ticket.isRemitted);
      const matchesVerification =
        !filter.verificationStatus ||
        filter.verificationStatus == "all" ||
        (filter.verificationStatus === "verified" ? ticket.isRemitted : !ticket.isRemitted);

      return matchesSearch && matchesSale && matchesVerification;
    });
  }, [debouncedSearch, filter.saleStatus, filter.verificationStatus, allocatedTickets]);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTickets.slice(start, end);
  }, [page, filteredTickets]);

  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="flex gap-3 items-center">
          <Input
            className="max-w-[450px]"
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            value={filter.search}
            placeholder="Search Ticket By Control Number"
          />
          <Dropdown
            className="max-w-fit"
            label="Select Option"
            placeholder="Select Sale Status"
            value={filter.saleStatus}
            items={saleOptions}
            onChange={(value) => setFilter((prev) => ({ ...prev, saleStatus: value }))}
          />
          <Dropdown
            className="max-w-fit"
            label="Select Option"
            placeholder="Select Verification Status"
            value={filter.verificationStatus}
            items={verificationOptions}
            onChange={(value) => setFilter((prev) => ({ ...prev, verificationStatus: value }))}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket Control Number</TableHead>
              <TableHead>Sale Status from Distributor</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length == 0 ? (
              <TableRow>
                <TableCell className="text-center py-10 text-gray-400" colSpan={4}>
                  No Tickets found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.ticketId}>
                  <TableCell>{formatTicket(ticket.controlNumber)}</TableCell>
                  <TableCell>
                    {ticket.status == "sold" || ticket.isRemitted ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green"></span>Sold
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red"></span>Unsold
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.isRemitted && ticket.status !== "sold" ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green"></span>Remitted
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red"></span>Pending
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedTicket(ticket)} variant="outline">
                      View Ticket
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="-mt-5">
          <Pagination
            currentPage={page}
            totalPage={Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {selectedTicket && (
        <Dialog onOpenChange={() => setSelectedTicket(null)} open={!!selectedTicket}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Allocation History</DialogTitle>
            </DialogHeader>
            <LongCard className="mt-8 w-full" label="Ticket">
              <LongCardItem label="Section" value={(selectedTicket.ticketSection + "").toUpperCase()} />
              {schedule.seatingType === "controlledSeating" && (
                <>
                  <LongCardItem label="Seat Number" value={selectedTicket.seatNumber + ""} />
                </>
              )}
              <LongCardItem label="Ticket Status" value={selectedTicket.status == "sold" || selectedTicket.isRemitted ? "Sold" : "Sold"} />
              <LongCardItem label="Verification Status" value={selectedTicket.isRemitted ? "Verified" : "Pending"} />
              <LongCardItem label="Ticket Price" value={selectedTicket.ticketPrice} />
            </LongCard>
            <div className="flex mt-5 gap-3 flex-col">
              <p className="text-lightGrey text-sm">Distributor Name</p>
              <p className="text-lg">{selectedTicket.distributor}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DistributorTicketsAllocated;

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
import Dropdown from "@/components/Dropdown";
import PaginatedTable from "@/components/PaginatedTable";

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

  return (
    <>
      <div className="flex flex-col">
        <div className="flex gap-3 items-center mb-10">
          <Input
            className="max-w-[450px]"
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            value={filter.search}
            placeholder="Search Ticket By Control Number"
          />
          <div className="flex gap-3">
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
        </div>

        <PaginatedTable
          data={filteredTickets}
          columns={[
            {
              key: "control",
              header: "Ticket Control Number",
              render: (ticket) => formatTicket(ticket.controlNumber),
            },
            {
              key: "status",
              header: "Sale Status from Distributor",
              render: (ticket) =>
                ticket.status == "sold" || ticket.isRemitted ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green"></span>Sold
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red"></span>Unsold
                  </div>
                ),
            },
            {
              key: "verification",
              header: "Verification Status",
              render: (ticket) =>
                ticket.isRemitted && ticket.status !== "sold" ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green"></span>Remitted
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red"></span>Pending
                  </div>
                ),
            },
            {
              key: "action",
              header: "Actions",
              render: (ticket) => (
                <Button onClick={() => setSelectedTicket(ticket)} variant="outline">
                  View Ticket
                </Button>
              ),
            },
          ]}
        />
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

import { useOutletContext } from "react-router-dom";
import type { AllocatedTicketToDistributor } from "@/types/ticket.ts";
import { useMemo, useState } from "react";
import type { Schedule } from "@/types/schedule.ts";
import { formatTicket } from "@/utils/controlNumber.ts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import PaginatedTable from "@/components/PaginatedTable";
import DialogPopup from "@/components/DialogPopup";
import ViewTicket from "@/components/ViewTicket";

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

  const [filter, setFilter] = useState({ search: "", saleStatus: "", verificationStatus: "" });

  const filteredTickets = useMemo(() => {
    return allocatedTickets.filter((ticket) => {
      const matchesSearch = !filter.search || ticket.controlNumber?.toString().includes(filter.search);
      const matchesSale =
        !filter.saleStatus ||
        filter.saleStatus == "all" ||
        (filter.saleStatus === "sold" ? ticket.isPaid || ticket.status === "sold" : !ticket.isPaid);
      const matchesVerification =
        !filter.verificationStatus ||
        filter.verificationStatus == "all" ||
        (filter.verificationStatus === "verified" ? ticket.isPaid : !ticket.isPaid);

      return matchesSearch && matchesSale && matchesVerification;
    });
  }, [filter.search, filter.saleStatus, filter.verificationStatus, allocatedTickets]);

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
                ticket.status == "sold" || ticket.isPaid ? (
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
                ticket.isPaid && ticket.status !== "sold" ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green"></span>Paid to CCA
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
                <DialogPopup className="max-w-3xl" title="Ticket Information" triggerElement={<Button>View Ticket</Button>}>
                  <ViewTicket
                    status={ticket.status}
                    ticketPrice={ticket.ticketPrice}
                    scheduleId={schedule.scheduleId}
                    controlNumber={ticket.controlNumber}
                  />
                </DialogPopup>
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default DistributorTicketsAllocated;

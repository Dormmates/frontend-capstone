import { useMemo, useState } from "react";
import type { DistributorScheduleTickets } from "../../../types/ticket";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";
import { useDebounce } from "../../../hooks/useDeabounce";
import TextInput from "../../../components/ui/TextInput";
import Dropdown from "../../../components/ui/Dropdown";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { formatTicket } from "../../../utils/controlNumber";

type Props = {
  schedule: DistributorScheduleTickets;
};

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Sold", value: "sold" },
  { label: "Unsold", value: "unsold" },
];

const remittanceStatusOptions = [
  { label: "All Remittance Status", value: "" },
  { label: "Verified", value: "verified" },
  { label: "Pending Remittance", value: "pending" },
];

const ViewAllocatedTickets = ({ schedule }: Props) => {
  const [filterOptions, setFilterOptions] = useState({ search: "", status: "", remittanceStatus: "" });
  const debouncedSearch = useDebounce(filterOptions.search);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [selectedTickets, setSelectedTickets] = useState<DistributorScheduleTickets["tickets"] | null>(null);

  const filteredTickets = useMemo(() => {
    if (!schedule?.tickets) return [];

    return schedule.tickets.filter((ticket) => {
      const matchesStatus =
        !filterOptions.status || (filterOptions.status === "unsold" ? ticket.status !== "sold" : ticket.status === filterOptions.status);

      const matchesRemittance =
        !filterOptions.remittanceStatus ||
        (filterOptions.remittanceStatus === "verified" && ticket.isRemitted) ||
        (filterOptions.remittanceStatus === "pending" && !ticket.isRemitted);

      const matchesSearch = !debouncedSearch.trim() || ticket.controlNumber.toString().includes(debouncedSearch);

      return matchesStatus && matchesRemittance && matchesSearch;
    });
  }, [schedule?.tickets, filterOptions.status, filterOptions.remittanceStatus, debouncedSearch]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  return (
    <div className="mt-10">
      <p className="mb-5">
        {schedule.show.title} ({formatToReadableDate(schedule.datetime + "") + " at " + formatToReadableTime(schedule.datetime + "")})
      </p>

      <div className="flex gap-3 mb-10">
        <TextInput
          className="max-w-[300px]"
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Search Ticket by Control Number"
        />
        <Dropdown
          onChange={(value) => setFilterOptions((prev) => ({ ...prev, status: value }))}
          options={statusOptions}
          value={filterOptions.status}
        />
        <Dropdown
          onChange={(value) => setFilterOptions((prev) => ({ ...prev, remittanceStatus: value }))}
          options={remittanceStatusOptions}
          value={filterOptions.remittanceStatus}
        />
      </div>

      <div className="flex gap-3 mb-5">
        <Button className="!bg-green" disabled={selectedTickets?.length === 0 || selectedTickets?.some((ticket) => ticket.status === "sold")}>
          Mark Selected as Sold
        </Button>
        <Button disabled={selectedTickets?.length === 0 || selectedTickets?.some((ticket) => ticket.status === "allocated")} className="!bg-red">
          Mark Selected as Unsold
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Control No.</TableHead>
            <TableHead>Seat Number</TableHead>
            <TableHead>Ticket Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remittance Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-5 text-gray-400">
                No Tickets Found
              </TableCell>
            </TableRow>
          ) : (
            paginatedTickets.map((ticket) => {
              return (
                <TableRow
                  className={selectedTickets?.some((t) => t.ticketId === ticket.ticketId) ? "bg-slate-300 text-black" : ""}
                  key={ticket.ticketId}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!ticket.isRemitted && (
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          id={ticket.ticketId}
                          checked={selectedTickets?.some((t) => t.ticketId === ticket.ticketId) ?? false}
                          onChange={(e) => {
                            setSelectedTickets((prev) => {
                              if (!prev) return e.target.checked ? [ticket] : null;

                              return e.target.checked ? [...prev, ticket] : prev.filter((t) => t.ticketId !== ticket.ticketId);
                            });
                          }}
                        />
                      )}
                      <label className="cursor-pointer" htmlFor={ticket.ticketId}>
                        {formatTicket(ticket.controlNumber)}
                      </label>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.seatNumber ?? "Free Seating"}</TableCell>
                  <TableCell>₱{ticket.ticketPrice}</TableCell>
                  <TableCell>
                    {ticket.status === "sold" ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green"></span>Sold
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red"></span>Unsold
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.isRemitted ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green"></span>Remitted
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red"></span>Pending
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {filteredTickets.length !== 0 && (
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            totalPage={Math.ceil(filteredTickets.length / pageSize)}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default ViewAllocatedTickets;

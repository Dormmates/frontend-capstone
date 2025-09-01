import { useOutletContext, useParams } from "react-router-dom";
import { useGetScheduleTickets } from "@/_lib/@react-client-query/schedule.ts";
import { useEffect, useMemo, useState } from "react";

import LongCard from "../../../../../components/LongCard";
import LongCardItem from "../../../../../components/LongCardItem";
import { useDebounce } from "@/hooks/useDeabounce.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import type { Schedule } from "@/types/schedule.ts";

import { formatTicket } from "@/utils/controlNumber.ts";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InputField from "@/components/InputField";

const statusOptions = [
  { name: "All Status", value: "all" },
  { name: "Sold", value: "sold" },
  { name: "Not Allocated", value: "not_allocated" },
  { name: "Allocated", value: "allocated" },
];

const sectionOptions = [
  { name: "All Seat Section", value: "all" },
  { name: "Orchestra Tickets", value: "orchestra" },
  { name: "Balcony Tickets", value: "balcony" },
  { name: "Complimentary Tickets", value: "complimentary" },
];

const ITEMS_PER_PAGE = 10;

const ScheduleTickets = () => {
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId } = useParams();
  const { data: tickets, isLoading: loadingTickets, isError: errorTickets } = useGetScheduleTickets(scheduleId as string);
  const [filterValues, setFilterValues] = useState({ controlNumber: "", section: "all", status: "all" });
  const debouncedSearch = useDebounce(filterValues.controlNumber);
  const [page, setPage] = useState(1);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      const matchStatus =
        filterValues.status === "all" ||
        (filterValues.status === "sold" && ticket.isRemitted) ||
        (filterValues.status === "allocated" && ticket.status === "allocated") ||
        (filterValues.status === "not_allocated" && ticket.status !== "allocated");

      const matchSection =
        filterValues.section === "all" ||
        (filterValues.section === "complimentary" && ticket.isComplimentary) ||
        ticket.ticketSection === filterValues.section;

      const matchControlNumber =
        !filterValues.controlNumber || filterValues.controlNumber == "all" || String(ticket.controlNumber) === filterValues.controlNumber.trim();
      return matchStatus && matchSection && matchControlNumber;
    });
  }, [tickets, filterValues.section, filterValues.status, debouncedSearch]);

  const paginatedTicket = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, page]);

  useEffect(() => {
    setPage(1);
  }, [filterValues.section, filterValues.status, debouncedSearch]);

  const summary = useMemo(() => {
    if (!tickets) return null;

    const allocated = tickets.filter((t) => t.distributorId !== null).length;
    const notAllocated = tickets.filter((ticket) => !ticket.isComplimentary).length - allocated;
    const sold = tickets.filter((t) => t.isRemitted).length;
    const unsold = allocated - sold;

    const orchestra = tickets.filter((t) => t.ticketSection === "orchestra").length;
    const balcony = tickets.filter((t) => t.ticketSection === "balcony").length;

    const complimentary = tickets.filter((t) => t.isComplimentary).length;

    return {
      total: tickets.length,
      sold,
      unsold,
      allocated,
      notAllocated,
      orchestra,
      balcony,
      complimentary,
    };
  }, [tickets]);

  if (loadingTickets) {
    return <h1>Loading...</h1>;
  }

  if (!tickets || errorTickets || !summary) {
    return <h1>Error loading tickets</h1>;
  }

  return (
    <>
      <h1 className="text-2xl">Ticket Information</h1>

      <div className="flex gap-2">
        <SimpleCard className="border-l-blue-400" label="Total Tickets" value={summary.total} />
        <SimpleCard className="border-l-green" label="Allocated Tickets" value={summary.allocated} />
        <SimpleCard className="border-l-lime-200" label="Not Allocated Tickets" value={summary.notAllocated} />
        <SimpleCard className="border-l-purple-400" label="Sold Tickets" value={summary.sold} />
        <SimpleCard className="border-l-red" label="Unsold Tickets" value={summary.unsold} />
      </div>

      <div>
        <LongCard label="Ticket Breadown">
          <LongCardItem label="Seating Configuration" value={schedule.seatingType.toUpperCase()} />
          <LongCardItem label="Orchestra" value={summary.orchestra} />
          <LongCardItem label="Balcony" value={summary.balcony} />
          <LongCardItem label="Complimentary" value={summary.complimentary} />
          <LongCardItem label="Total" value={summary.total} />
        </LongCard>
      </div>

      <div>
        <div className="flex gap-5 mt-10 w-full">
          <InputField
            className="max-w-[400px]"
            placeholder="Search Tickets by Control Number"
            value={filterValues.controlNumber}
            onChange={(e) => setFilterValues((prev) => ({ ...prev, controlNumber: e.target.value.trim() }))}
          />
          <div className="flex gap-5">
            <Dropdown
              className="w-fit"
              label="Select Status"
              placeholder="Select Status"
              items={statusOptions}
              onChange={(value) => setFilterValues((prev) => ({ ...prev, status: value }))}
              value={filterValues.status}
            />
            <Dropdown
              className="w-fit"
              label="Select Status"
              placeholder="Select Section"
              items={sectionOptions}
              onChange={(value) => setFilterValues((prev) => ({ ...prev, section: value }))}
              value={filterValues.section}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Pagination
            currentPage={page}
            totalPage={Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              <TableHead>Control No.</TableHead>
              <TableHead>Seat Section</TableHead>
              {schedule.seatingType === "controlledSeating" && <TableHead>Seat Number</TableHead>}
              <TableHead>Is Complimentary</TableHead>
              <TableHead>Ticket Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTicket.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-10 text-gray-400" colSpan={schedule.seatingType === "controlledSeating" ? 6 : 5}>
                  No Ticket Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTicket.map((ticket) => (
                <TableRow key={ticket.ticketId}>
                  <TableCell>{formatTicket(ticket.controlNumber)}</TableCell>
                  <TableCell>{ticket.ticketSection?.toUpperCase() ?? "Complimentary Seat"}</TableCell>
                  {schedule.seatingType === "controlledSeating" && <TableCell>{ticket.seatNumber}</TableCell>}
                  <TableCell>{ticket.isComplimentary ? "Yes" : "No"}</TableCell>
                  <TableCell>{["sold", "remitted"].includes(ticket.status) ? "Sold" : ticket.status}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end  items-center ">
                      <Button>View Ticket</Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Ticket Options</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Select Options</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            <DropdownMenuItem>Transfer Ticket to another Schedule</DropdownMenuItem>
                            {ticket.isComplimentary && <DropdownMenuItem> Mark as Non-Complimentary</DropdownMenuItem>}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ScheduleTickets;

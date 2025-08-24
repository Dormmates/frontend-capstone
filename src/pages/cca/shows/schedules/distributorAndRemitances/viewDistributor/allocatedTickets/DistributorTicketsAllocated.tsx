import { useOutletContext } from "react-router-dom";
import type { AllocatedTicketToDistributor } from "../../../../../../../types/ticket";
import { useMemo, useState } from "react";
import { useDebounce } from "../../../../../../../hooks/useDeabounce";
import TextInput from "../../../../../../../components/ui/TextInput";
import Dropdown from "../../../../../../../components/ui/Dropdown";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../components/ui/Table";
import Button from "../../../../../../../components/ui/Button";

const ITEMS_PER_PAGE = 5;

const verificationOptions = [
  { label: "All Verification Status", value: "" },
  { label: "Verified", value: "verified" },
  { label: "Pending", value: "pending" },
];

const saleOptions = [
  { label: "All Sale Status", value: "" },
  { label: "Sold", value: "sold" },
  { label: "Unsold", value: "unsold" },
];

const DistributorTicketsAllocated = () => {
  const { allocatedTickets } = useOutletContext<{ allocatedTickets: AllocatedTicketToDistributor[] }>();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ search: "", saleStatus: "", verificationStatus: "" });
  const debouncedSearch = useDebounce(filter.search);

  const filteredTickets = useMemo(() => {
    return allocatedTickets.filter((ticket) => {
      const matchesSearch = !debouncedSearch || ticket.controlNumber?.toString().includes(debouncedSearch);
      const matchesSale = !filter.saleStatus || (filter.saleStatus === "sold" ? ticket.status === "sold" : ticket.status !== "sold");
      const matchesVerification = !filter.verificationStatus || (filter.verificationStatus === "verified" ? ticket.isRemitted : !ticket.isRemitted);

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
          <TextInput
            className="max-w-[450px]"
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            value={filter.search}
            placeholder="Search Ticket By Control Number"
          />
          <Dropdown value={filter.saleStatus} options={saleOptions} onChange={(value) => setFilter((prev) => ({ ...prev, saleStatus: value }))} />
          <Dropdown
            value={filter.verificationStatus}
            options={verificationOptions}
            onChange={(value) => setFilter((prev) => ({ ...prev, verificationStatus: value }))}
          />
        </div>

        <Table>
          <TableHeader>
            <TableHead>Ticket Control Number</TableHead>
            <TableHead>Sale Status from Distributor</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Action</TableHead>
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
                <TableRow>
                  <TableCell>{ticket.controlNumber}</TableCell>
                  <TableCell>
                    {ticket.status === "sold" ? (
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
                    {ticket.isRemitted ? (
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
                    <Button className="!bg-gray !text-black !border-lightGrey border-2">View Ticket</Button>
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
    </>
  );
};

export default DistributorTicketsAllocated;

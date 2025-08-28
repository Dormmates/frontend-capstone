import { useMemo, useState } from "react";
import type { DistributorScheduleTickets } from "../../../types/ticket";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";
import { useDebounce } from "../../../hooks/useDeabounce";
import TextInput from "../../../components/ui/TextInput";
import Dropdown from "../../../components/ui/Dropdown";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { formatTicket } from "../../../utils/controlNumber";
import { useMarkTicketAsSold, useMarkTicketAsUnSold } from "../../../_lib/@react-client-query/schedule";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/ui/Modal";
import LongCard from "../../../components/ui/LongCard";
import LongCardItem from "../../../components/ui/LongCardItem";
import InputLabel from "../../../components/ui/InputLabel";
import { useAuthContext } from "../../../context/AuthContext";
import ToastNotification from "../../../utils/toastNotification";
import { formatCurrency, isValidEmail } from "../../../utils";

type Props = {
  schedule: DistributorScheduleTickets;
  closeModal: () => void;
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

const ViewAllocatedTickets = ({ schedule, closeModal }: Props) => {
  const queryClient = useQueryClient();
  const markSold = useMarkTicketAsSold();
  const markUnsold = useMarkTicketAsUnSold();

  const { user } = useAuthContext();
  const [filterOptions, setFilterOptions] = useState({ search: "", status: "", remittanceStatus: "" });
  const debouncedSearch = useDebounce(filterOptions.search);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [selectedTickets, setSelectedTickets] = useState<DistributorScheduleTickets["tickets"] | []>([]);
  const [isSummary, setIsSumamry] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({ email: "", customerName: "", isIncluded: false });
  const [errors, setErrors] = useState<{ email?: string; customerName?: string }>({});

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (customerInfo.isIncluded) {
      if (!customerInfo.customerName || customerInfo.customerName.length < 5) {
        newErrors.customerName = "Please provide atleast 5 characters";
        isValid = false;
      }

      if (!customerInfo.email || !isValidEmail(customerInfo.email)) {
        newErrors.email = "Please provide a valid email";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (action: "sold" | "unsold") => {
    if (!validate()) return;

    const payload: any = {
      distributorId: user?.userId,
      scheduleId: schedule.scheduleId,
      controlNumbers: selectedTickets.map((ticket) => ticket.controlNumber),
      isIncluded: customerInfo.isIncluded,
      ...(action === "sold" && {
        customerName: customerInfo.customerName,
        email: customerInfo.email,
      }),
    };

    const mutation = action === "sold" ? markSold : markUnsold;

    mutation.mutate(payload, {
      onSuccess: () => {
        queryClient.setQueryData<DistributorScheduleTickets[]>(["show and schedules", "distributor", user?.userId as string], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((sched) => {
            if (sched.scheduleId !== schedule.scheduleId) return sched;

            return {
              ...sched,
              tickets: sched.tickets.map((ticket) =>
                payload.controlNumbers.includes(ticket.controlNumber) ? { ...ticket, status: action === "sold" ? "sold" : "allocated" } : ticket
              ),
            };
          });
        });

        closeModal();
        if (action === "sold") {
          setCustomerInfo({ email: "", customerName: "", isIncluded: false });
        }
        setIsSumamry(false);
        ToastNotification.success(`Marked as ${action}`);
      },
      onError: (err) => {
        ToastNotification.error(err.message);
      },
    });
  };

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
        <Button
          onClick={() => setIsSumamry(true)}
          className="!bg-green"
          disabled={selectedTickets?.length === 0 || selectedTickets?.some((ticket) => ticket.status === "sold")}
        >
          Mark Selected as Sold
        </Button>
        <Button
          onClick={() => handleSubmit("unsold")}
          disabled={selectedTickets?.length === 0 || selectedTickets?.some((ticket) => ticket.status === "allocated")}
          className="!bg-red"
        >
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
                              if (!prev) return e.target.checked ? [ticket] : [];
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
                  <TableCell>{formatCurrency(ticket.ticketPrice)}</TableCell>
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

      {isSummary && (
        <Modal
          className="w-full max-w-[650px]"
          title="Summary"
          isOpen={isSummary}
          onClose={() => {
            setCustomerInfo({ email: "", customerName: "", isIncluded: false });
            setIsSumamry(false);
          }}
        >
          <p className="mb-5 mt-10">
            {schedule.show.title} ({formatToReadableDate(schedule.datetime + "") + " at " + formatToReadableTime(schedule.datetime + "")})
          </p>

          <LongCard className="w-full" label="Ticket Details">
            <LongCardItem label="Total Tickets" value={selectedTickets.length} />
            <LongCardItem
              className="!whitespace-normal"
              label="Control Numbers"
              value={selectedTickets.map((ticket) => ticket.controlNumber).join(", ")}
            />
          </LongCard>

          <div className="flex gap-2 items-center my-5">
            <input
              id="cust-info"
              className="cursor-pointer"
              type="checkbox"
              checked={customerInfo.isIncluded}
              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, isIncluded: e.target.checked }))}
            />
            <InputLabel
              className="mb-0"
              label={
                <label className="cursor-pointer" htmlFor="cust-info">
                  Input Customer Info
                </label>
              }
            />
          </div>

          {customerInfo.isIncluded && (
            <div className="flex flex-col gap-2">
              <TextInput
                disabled={markSold.isPending}
                isError={!!errors.email}
                errorMessage={errors.email}
                label="Customer Email"
                onChange={handleInputChange}
                value={customerInfo.email}
                type="email"
                name="email"
              />
              <TextInput
                disabled={markSold.isPending}
                isError={!!errors.customerName}
                errorMessage={errors.customerName}
                label="Customer Name"
                onChange={handleInputChange}
                value={customerInfo.customerName}
                name="customerName"
              />
            </div>
          )}

          <div className="flex gap-3 items-center justify-end mt-5">
            <Button disabled={markSold.isPending} onClick={() => handleSubmit("sold")} className="!bg-green">
              Confirm
            </Button>
            <Button
              disabled={markSold.isPending}
              onClick={() => {
                setCustomerInfo({ email: "", customerName: "", isIncluded: false });
                setIsSumamry(false);
              }}
              className="!bg-red"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewAllocatedTickets;

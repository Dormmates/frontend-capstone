import React, { useEffect, useMemo, useState } from "react";
import type { DistributorScheduleTickets } from "@/types/ticket.ts";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTicket } from "@/utils/controlNumber.ts";
import { useMarkTicketAsSold, useMarkTicketAsUnSold } from "@/_lib/@react-client-query/schedule.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { formatCurrency, isValidEmail } from "@/utils";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SeatingConfiguration } from "@/types/schedule";
import InputField from "@/components/InputField";
import LongCardItem from "@/components/LongCardItem";
import LongCard from "@/components/LongCard";
import DialogPopup from "@/components/DialogPopup";
import TicketSeatLocation from "@/components/TicketSeatLocation";

type Props = {
  schedule: DistributorScheduleTickets;
  closeModal: () => void;
};

const ViewAllocatedTickets = ({ schedule, closeModal }: Props) => {
  const queryClient = useQueryClient();
  const markSold = useMarkTicketAsSold();
  const markUnsold = useMarkTicketAsUnSold();

  const { user } = useAuthContext();
  const [isSummary, setIsSummary] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<DistributorScheduleTickets["tickets"]>([]);

  const [customerInfo, setCustomerInfo] = useState({ email: "", customerName: "", isIncluded: false });
  const [errors, setErrors] = useState<{ email?: string; customerName?: string }>({});

  const summary = useMemo(() => {
    const total = schedule.tickets.length;
    const sold = schedule.tickets.filter((t) => t.status === "sold").length;
    const unsold = schedule.tickets.length - sold;
    const remitted = schedule.tickets.filter((t) => t.isRemitted).length;
    const pending = schedule.tickets.filter((t) => !t.isRemitted).length;
    return { sold, unsold, remitted, pending, total };
  }, [schedule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (customerInfo.isIncluded) {
      if (!customerInfo.customerName || customerInfo.customerName.length < 5) {
        newErrors.customerName = "Please provide at least 5 characters";
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

    toast.promise(
      mutation.mutateAsync(payload).then(() => {
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
        setSelectedTickets([]);
        if (action === "sold") {
          setCustomerInfo({ email: "", customerName: "", isIncluded: false });
        }
        setIsSummary(false);
      }),
      {
        position: "top-center",
        loading: `Marking as ${action}...`,
        success: `Marked as ${action}`,
        error: (err) => err.message || `Failed to mark as ${action}`,
      }
    );
  };

  return (
    <div className="overflow-x-auto">
      <p className="mb-5">
        {schedule.show.title} ({formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")})
      </p>

      <div className="flex flex-col gap-2 mb-5">
        <div className="">
          <Label>Sale Progress {(((summary.sold + summary.remitted) / schedule.tickets.length) * 100).toFixed(2)}%</Label>
          <Progress value={Number((((summary.sold + summary.remitted) / schedule.tickets.length) * 100).toFixed(2))} />
        </div>

        <div className="">
          <Label>Remittance Progress {((summary.remitted / summary.total) * 100).toFixed(2)}%</Label>
          <Progress value={Number(((summary.remitted / summary.total) * 100).toFixed(2))} />
        </div>
      </div>

      <Tabs defaultValue="unsold">
        <TabsList className="bg-sidebar-border mb-2">
          {/* <TabsTrigger value="all">All</TabsTrigger> */}
          <TabsTrigger value="unsold">Unsold</TabsTrigger>
          <TabsTrigger value="forRemittance">For Remittance / Marked As Sold</TabsTrigger>
          <TabsTrigger value="remittedTickets">Remitted Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <TicketTableData
            scheduleId={schedule.scheduleId}
            seatingType={schedule.seatingType}
            type="all"
            data={schedule.tickets}
            selectedTickets={selectedTickets}
            setSelectedTickets={setSelectedTickets}
          />
        </TabsContent>
        <TabsContent value="unsold">
          <div className="flex flex-col">
            {selectedTickets.length !== 0 && (
              <Button onClick={() => setIsSummary(true)} className="self-end">
                Sell Tickets
              </Button>
            )}
            <TicketTableData
              scheduleId={schedule.scheduleId}
              seatingType={schedule.seatingType}
              type="unsold"
              data={schedule.tickets.filter((t) => !t.isRemitted && t.status === "allocated")}
              selectedTickets={selectedTickets}
              setSelectedTickets={setSelectedTickets}
            />
          </div>
        </TabsContent>
        <TabsContent value="forRemittance">
          <div className="flex flex-col">
            {selectedTickets.length !== 0 && (
              <Button onClick={() => handleSubmit("unsold")} className="self-end">
                Mark as Unsold
              </Button>
            )}
            <TicketTableData
              scheduleId={schedule.scheduleId}
              seatingType={schedule.seatingType}
              type="forRemittance"
              data={schedule.tickets.filter((t) => !t.isRemitted && t.status === "sold")}
              selectedTickets={selectedTickets}
              setSelectedTickets={setSelectedTickets}
            />
          </div>
        </TabsContent>
        <TabsContent value="remittedTickets">
          <TicketTableData
            scheduleId={schedule.scheduleId}
            seatingType={schedule.seatingType}
            type="remittedTickets"
            data={schedule.tickets.filter((t) => t.isRemitted)}
            selectedTickets={selectedTickets}
            setSelectedTickets={setSelectedTickets}
          />
        </TabsContent>
      </Tabs>

      {isSummary && (
        <Modal
          title="Summary"
          isOpen={isSummary}
          onClose={() => {
            setCustomerInfo({ email: "", customerName: "", isIncluded: false });
            setIsSummary(false);
          }}
        >
          <p className="mb-5">
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
            <Label htmlFor="cust-info"> Input Customer Info</Label>
          </div>
          {customerInfo.isIncluded && (
            <div className="flex flex-col gap-2">
              <InputField
                disabled={markSold.isPending}
                error={errors.email}
                label="Customer Email"
                onChange={handleInputChange}
                value={customerInfo.email}
                type="email"
                name="email"
              />
              <InputField
                disabled={markSold.isPending}
                error={errors.customerName}
                label="Customer Name"
                onChange={handleInputChange}
                value={customerInfo.customerName}
                name="customerName"
              />
            </div>
          )}
          <div className="flex gap-3 items-center justify-end mt-5">
            <Button
              onClick={() => {
                setCustomerInfo({ email: "", customerName: "", isIncluded: false });
                setIsSummary(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={() => handleSubmit("sold")}>Confirm</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

type TicketTableDataProps = {
  data: DistributorScheduleTickets["tickets"];
  type: "all" | "unsold" | "forRemittance" | "remittedTickets";
  seatingType: SeatingConfiguration;
  scheduleId: string;
  selectedTickets: DistributorScheduleTickets["tickets"];
  setSelectedTickets: React.Dispatch<React.SetStateAction<DistributorScheduleTickets["tickets"]>>;
};

const TicketTableData = ({ data, type, seatingType, scheduleId, selectedTickets, setSelectedTickets }: TicketTableDataProps) => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  useEffect(() => {
    setSelectedTickets([]);
  }, []);

  return (
    <div>
      {selectedTickets.length > 0 && <p className="font-bold text-sm mb-2">Selected Tickets: {selectedTickets.length}</p>}
      <div className="overflow-x-auto rounded-lg border min-w-[500px]">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="flex items-center gap-2 text-muted-foreground">
                {(type === "unsold" || type === "forRemittance") && paginatedTickets.length > 0 ? (
                  <>
                    <Checkbox
                      id="all"
                      checked={
                        paginatedTickets.length > 0 && paginatedTickets.every((ticket) => selectedTickets.some((t) => t.ticketId === ticket.ticketId))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newTickets = paginatedTickets.filter((ticket) => !selectedTickets.some((t) => t.ticketId === ticket.ticketId));
                          setSelectedTickets([...selectedTickets, ...newTickets]);
                        } else {
                          setSelectedTickets(selectedTickets.filter((t) => !paginatedTickets.some((ticket) => ticket.ticketId === t.ticketId)));
                        }
                      }}
                    />
                    <Label htmlFor="all">Control No.</Label>
                  </>
                ) : (
                  <p>Control No.</p>
                )}
              </TableHead>
              <TableHead>Seat Number</TableHead>
              <TableHead>Ticket Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remittance Status</TableHead>
              {seatingType === "controlledSeating" && <TableHead className="text-end">Actions</TableHead>}
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
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.ticketId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!ticket.isRemitted && (
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          id={ticket.ticketId}
                          checked={selectedTickets.some((t) => t.ticketId === ticket.ticketId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTickets([...selectedTickets, ticket]);
                            } else {
                              setSelectedTickets(selectedTickets.filter((t) => t.ticketId !== ticket.ticketId));
                            }
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
                    {ticket.status === "sold" || ticket.isRemitted ? (
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
                    {ticket.isRemitted && ticket.status !== "sold" ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green"></span>Remitted
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red"></span>Pending
                      </div>
                    )}
                  </TableCell>
                  {seatingType === "controlledSeating" && (
                    <TableCell className="flex justify-end">
                      <DialogPopup
                        className="max-w-screen-2xl h-[98%] w-[98%]"
                        title="Seat Location"
                        triggerElement={<Button variant="outline">View Seat Location</Button>}
                      >
                        <TicketSeatLocation controlNumber={ticket.controlNumber} scheduleId={scheduleId} />
                      </DialogPopup>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination currentPage={currentPage} totalPage={Math.ceil(data.length / pageSize)} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ViewAllocatedTickets;

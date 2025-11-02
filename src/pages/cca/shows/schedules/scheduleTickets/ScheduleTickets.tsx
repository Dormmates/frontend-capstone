import { useOutletContext, useParams } from "react-router-dom";
import { useGetScheduleTickets, useTrainerSellTicket, useRefundTicket } from "@/_lib/@react-client-query/schedule.ts";
import { useEffect, useMemo, useState } from "react";
import type { Schedule } from "@/types/schedule.ts";
import { formatTicket } from "@/utils/controlNumber.ts";
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
import { DataTable } from "@/components/DataTable";
import type { Ticket } from "@/types/ticket";
import { Label, Pie, PieChart, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Settings2Icon } from "lucide-react";
import SimpleCard from "@/components/SimpleCard";
import DialogPopup from "@/components/DialogPopup";
import ViewTicket from "@/components/ViewTicket";
import { formatCurrency, isValidEmail } from "@/utils";
import { formatSectionName } from "@/utils/seatmap";
import { distributorTypeOptions } from "@/types/user";
import Modal from "@/components/Modal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label as InputLabel } from "@/components/ui/label";
import { useAuthContext } from "@/context/AuthContext";
import TransferTicket from "./TransferTicket";
import type { ShowData } from "@/types/show";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

const statusOptions = [
  { name: "All Status", value: "all" },
  { name: "Paid to CCA", value: "paidToCCA" },
  { name: "Marked Sold by Distirbutor", value: "sold" },
  { name: "Allocated", value: "allocated" },
  { name: "Not Allocated", value: "not_allocated" },
  { name: "Remitted Tickets", value: "remitted" },
];

const sectionOptions = [
  { name: "All Tickets", value: "all" },
  { name: "Regular Tickets", value: "regular" },
  { name: "Complimentary Tickets", value: "complimentary" },
];

const seatSectionOptions = [
  { name: "All Sections", value: "all" },
  { name: "Orchestra Left", value: "orchestraLeft" },
  { name: "Orchestra Middle", value: "orchestraMiddle" },
  { name: "Orchestra Right", value: "orchestraRight" },
  { name: "Balcony Left", value: "balconyLeft" },
  { name: "Balcony Middle", value: "balconyMiddle" },
  { name: "Balcony Right", value: "balconyRight" },
];

const ITEMS_PER_PAGE = 10;

const ScheduleTickets = () => {
  const { user } = useAuthContext();
  const { schedule, show } = useOutletContext<{ schedule: Schedule; show: ShowData }>();
  const { scheduleId } = useParams();
  const { data: tickets, isLoading: loadingTickets, isError: errorTickets } = useGetScheduleTickets(scheduleId as string);
  const [filterValues, setFilterValues] = useState({ controlNumber: "", section: "all", status: "all", seatSection: "all" });
  const [page, setPage] = useState(1);

  const [isSellTicket, setIsSellTicket] = useState(false);
  const [isUnSellTicket, setUnIsSellTicket] = useState(false);
  const [isTransferTicket, setIsTransferTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      const matchStatus =
        filterValues.status === "all" || (filterValues.status === "paidToCCA" && ticket.isPaid) || filterValues.status == ticket.status;

      const matchSection =
        filterValues.section === "all" ||
        (filterValues.section === "complimentary" && ticket.isComplimentary) ||
        (filterValues.section === "regular" && !ticket.isComplimentary);

      const matchSeatSection = filterValues.seatSection === "all" || ticket.seatSection === filterValues.seatSection;

      const matchControlNumber =
        !filterValues.controlNumber ||
        filterValues.controlNumber === "all" ||
        String(ticket.controlNumber).trim() === filterValues.controlNumber.trim();

      return matchStatus && matchSection && matchControlNumber && matchSeatSection;
    });
  }, [tickets, filterValues.section, filterValues.status, filterValues.controlNumber, filterValues.seatSection, filterValues.controlNumber]);

  const paginatedTicket = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, page]);

  useEffect(() => {
    setPage(1);
  }, [filterValues.section, filterValues.status, filterValues.controlNumber]);

  const summary = useMemo(() => {
    if (!tickets)
      return {
        total: 0,
        sold: 0,
        unsold: 0,
        regularTickets: 0,
        complimentary: 0,
      };

    const sold = tickets.filter((t) => t.isPaid || t.status === "remitted").length;
    const unsold = tickets.length - sold;
    const regularTickets = tickets.filter((t) => !t.isComplimentary).length;
    const complimentary = tickets.filter((t) => t.isComplimentary).length;

    return {
      total: tickets.length,
      sold,
      unsold,
      regularTickets,
      complimentary,
    };
  }, [tickets]);

  const ticketInformationSummaryData = [
    { name: "sold", value: summary.sold, fill: "green" },
    { name: "unsold", value: summary.unsold, fill: "red" },
    { name: "complimentary", value: summary.complimentary, fill: "hsl(var(--chart-4))" },
  ];

  const ticketInformationSummaryConfig = {
    allocated: {
      label: "Allocated Tickets",
    },
    not: {
      label: "Not Allocated Tickets",
    },
    sold: {
      label: "Sold Tickets",
    },
    unsold: {
      label: "Unsold Tickets",
    },
    complimentary: {
      label: "Complimentary Tickets",
    },
  } satisfies ChartConfig;

  if (loadingTickets) {
    return <Loading />;
  }

  if (!tickets || errorTickets || !summary) {
    return <Error />;
  }

  return (
    <>
      <h1 className="text-2xl">Schedule Tickets</h1>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex gap-2 lg:flex-col">
          <SimpleCard label="Total Tickets" value={summary.total} />
          <SimpleCard label="Regular Tickets" value={summary.regularTickets} />
          <SimpleCard label="Complimentary Tickets" value={summary.complimentary} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Statuses Breakdown</CardTitle>
            <CardDescription> Visual representation of ticket statuses breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ticketInformationSummaryConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={ticketInformationSummaryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                  activeIndex={0}
                  activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => <Sector {...props} outerRadius={outerRadius + 10} />}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                              {summary.total}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                              Total Tickets
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
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
              label="Select"
              placeholder="Select"
              items={sectionOptions}
              onChange={(value) => setFilterValues((prev) => ({ ...prev, section: value }))}
              value={filterValues.section}
            />
            {schedule.seatingType == "controlledSeating" && (
              <Dropdown
                className="w-fit"
                label="Select Section"
                placeholder="Select Section"
                items={seatSectionOptions}
                onChange={(value) => setFilterValues((prev) => ({ ...prev, seatSection: value }))}
                value={filterValues.seatSection}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end mb-5">
          <Pagination
            currentPage={page}
            totalPage={Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>

        <p className="text-sm font-bold mb-1">Total: {filteredTickets.length}</p>

        <DataTable
          data={paginatedTicket}
          columns={[
            {
              key: "no.",
              header: "Contro No.",
              render: (ticket) => formatTicket(ticket.controlNumber),
            },
            {
              key: "price.",
              header: "Ticket Price",
              render: (ticket) => formatCurrency(ticket.ticketPrice),
            },
            {
              key: "distributor.",
              header: "Ticket Distributor",
              render: (ticket) =>
                ticket.distributorName
                  ? `${ticket.distributorName} (${distributorTypeOptions.find((d) => d.value == ticket.distributorType)?.name ?? "Trainer"})`
                  : "",
            },

            ...(schedule.seatingType === "controlledSeating"
              ? [
                  {
                    key: "seat",
                    header: "Seat Number",
                    render: (ticket: Ticket) => ticket.seatNumber,
                  },
                ]
              : []),

            ...(schedule.seatingType === "controlledSeating"
              ? [
                  {
                    key: "section",
                    header: "Section",
                    render: (ticket: Ticket) => formatSectionName(ticket.seatSection ?? "Na alis"),
                  },
                ]
              : []),
            {
              key: "complimentary",
              header: "Is Complimentary",
              render: (ticket) => (ticket.isComplimentary ? "Yes" : "No"),
            },
            {
              key: "status",
              header: "Ticket Status",
              render: (ticket) => formatSectionName(ticket.status),
            },
            {
              key: "customer",
              header: "Customer Information",
              render: (ticket) =>
                ticket.customerEmail && ticket.customerName ? (
                  <span>
                    {ticket.customerName} ({ticket.customerEmail})
                  </span>
                ) : (
                  ""
                ),
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (ticket) => (
                <div className="flex gap-2 justify-end  items-center ">
                  <DialogPopup className="max-w-3xl" title="Ticket Information" triggerElement={<Button variant="secondary">View Ticket</Button>}>
                    <ViewTicket
                      status={ticket.status}
                      ticketPrice={ticket.ticketPrice}
                      scheduleId={scheduleId as string}
                      controlNumber={ticket.controlNumber}
                    />
                  </DialogPopup>

                  {schedule.isOpen && (user?.roles.includes("head") || show.showType !== "majorProduction") && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Settings2Icon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" align="start">
                          <DropdownMenuLabel>Select Options</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {!ticket.isComplimentary && ticket.isPaid && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setIsTransferTicket(true);
                                }}
                              >
                                Transfer Ticket
                              </DropdownMenuItem>
                            )}
                            {!ticket.isComplimentary && ticket.status == "not_allocated" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsSellTicket(true);
                                  setSelectedTicket(ticket);
                                }}
                              >
                                Sell Ticket
                              </DropdownMenuItem>
                            )}
                            {!ticket.isComplimentary && ticket.isPaid && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setUnIsSellTicket(true);
                                  setSelectedTicket(ticket);
                                }}
                              >
                                Refund Ticket
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {isSellTicket && !!selectedTicket && (
        <Modal
          onClose={() => {
            setIsSellTicket(false);
            setSelectedTicket(null);
          }}
          title="Sell Ticket"
          isOpen={isSellTicket && !!selectedTicket}
        >
          <SellTicket
            setSelectedTicket={setSelectedTicket}
            setSellTicket={setIsSellTicket}
            scheduleId={scheduleId as string}
            ticket={selectedTicket}
          />
        </Modal>
      )}

      {isTransferTicket && !!selectedTicket && (
        <Modal
          className="max-w-7xl max-h-[90%] overflow-y-auto"
          onClose={() => {
            setIsTransferTicket(false);
            setSelectedTicket(null);
          }}
          title="Transfer Ticket"
          isOpen={isTransferTicket && !!selectedTicket}
        >
          <TransferTicket show={show} schedule={schedule} ticket={selectedTicket} />
        </Modal>
      )}

      {isUnSellTicket && !!selectedTicket && (
        <Modal
          onClose={() => {
            setUnIsSellTicket(false);
            setSelectedTicket(null);
          }}
          title="Unsold the Ticket"
          isOpen={isUnSellTicket && !!selectedTicket}
        >
          <UnSellTicket
            setSelectedTicket={setSelectedTicket}
            setUnSellTicket={setUnIsSellTicket}
            scheduleId={scheduleId as string}
            ticket={selectedTicket}
          />
        </Modal>
      )}
    </>
  );
};

type SellTicketProps = {
  ticket: Ticket;
  scheduleId: string;
  setSellTicket: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
};

const SellTicket = ({ ticket, scheduleId, setSellTicket, setSelectedTicket }: SellTicketProps) => {
  const { user } = useAuthContext();

  const queryClient = useQueryClient();
  const sellTicket = useTrainerSellTicket();

  const [customerInfo, setCustomerInfo] = useState({ email: "", name: "", includeInfo: false });
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const submit = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (customerInfo.includeInfo) {
      if (!customerInfo.name) {
        newErrors.name = "Please enter customer name";
        isValid = false;
      }

      if (!customerInfo.email) {
        newErrors.email = "Please enter customer email";
        isValid = false;
      } else if (!isValidEmail(customerInfo.email)) {
        newErrors.name = "Please enter a valid email format";
        isValid = false;
      }

      setErrors(newErrors);
    }

    if (!isValid) {
      return;
    }

    const payload: { scheduleId: string; controlNumber: number; trainerId: string; customerEmail?: string; customerName?: string } = {
      trainerId: user?.userId as string,
      scheduleId,
      controlNumber: ticket.controlNumber,
    };

    if (customerInfo.includeInfo) {
      payload.customerEmail = customerInfo.email.trim();
      payload.customerName = customerInfo.name.trim();
    }

    toast.promise(sellTicket.mutateAsync(payload), {
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId], exact: true });
        setSellTicket(false);
        setSelectedTicket(null);
        return "Ticket Sold and Paid";
      },
      error: (err) => err.message || "Failed to Sell Ticket, please try again later",
      loading: "Ticket is being processed",
      position: "top-center",
    });
  };

  return (
    <div>
      <div>
        <p>Ticket Control Number: {formatTicket(ticket.controlNumber)}</p>
        <p>Ticket Price: {formatCurrency(ticket.ticketPrice)}</p>
      </div>

      <div className="flex items-center gap-2 mb-3 text-yellow-700 text-sm bg-yellow-50 border-2 border-yellow-200 rounded-md p-2 mt-3">
        <div className="flex gap-1 flex-col">
          <p className="font-bold">Note: </p>
          <p>
            When a trainer sells a ticket directly, the ticket will be marked as <span className="font-medium">sold</span> and automatically{" "}
            <span className="font-medium">paid</span>. The trainer will be recorded as the seller of that ticket.
          </p>
        </div>
      </div>

      <div className="flex gap-2 items-center my-5">
        <input
          id="cust-info"
          className="cursor-pointer"
          type="checkbox"
          checked={customerInfo.includeInfo}
          onChange={(e) => setCustomerInfo((prev) => ({ ...prev, includeInfo: e.target.checked }))}
        />
        <InputLabel htmlFor="cust-info">Input Customer Info</InputLabel>
      </div>
      {customerInfo.includeInfo && (
        <div className="flex flex-col gap-2 border p-5 rounded-md">
          <InputField
            disabled={sellTicket.isPending}
            error={errors.email}
            label="Customer Email"
            onChange={handleInputChange}
            value={customerInfo.email}
            type="email"
            name="email"
          />
          <InputField
            disabled={sellTicket.isPending}
            error={errors.name}
            label="Customer Name"
            onChange={handleInputChange}
            value={customerInfo.name}
            name="name"
          />
        </div>
      )}
      <div className="flex justify-end mt-3">
        <Button disabled={sellTicket.isPending} onClick={submit}>
          Sell Ticket
        </Button>
      </div>
    </div>
  );
};

type UnSellTicketProps = {
  ticket: Ticket;
  scheduleId: string;
  setUnSellTicket: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
};

const UnSellTicket = ({ ticket, scheduleId, setUnSellTicket, setSelectedTicket }: UnSellTicketProps) => {
  const { user } = useAuthContext();

  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const refundTicket = useRefundTicket();

  const submit = () => {
    const payload: { scheduleId: string; controlNumber: number; trainerId: string; distributorId: string; remarks: string } = {
      trainerId: user?.userId as string,
      scheduleId,
      controlNumber: ticket.controlNumber,
      distributorId: ticket?.distributorId ?? (user?.userId as string),
      remarks,
    };

    toast.promise(refundTicket.mutateAsync(payload), {
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId], exact: true });
        setUnSellTicket(false);
        setSelectedTicket(null);
        return "Ticket Unsold and Unpaid";
      },
      error: (err) => err.message || "Failed to Unsold the Ticket, please try again later",
      loading: "Ticket is being processed",
      position: "top-center",
    });
  };

  return (
    <div>
      <div>
        <p>Ticket Control Number: {formatTicket(ticket.controlNumber)}</p>
        <p>Ticket Price: {formatCurrency(ticket.ticketPrice)}</p>
      </div>

      <div className="flex items-center gap-2 mb-3 text-yellow-700 text-sm bg-yellow-50 border-2 border-yellow-200 rounded-md p-2 mt-3">
        <div className="flex gap-1 flex-col">
          <p className="font-bold">Note: </p>
          <p>
            Refunding the ticket will revert the ticket’s status to <span className="font-medium">available</span> and update its payment record.
            Please ensure this action is intended before proceeding.
          </p>
        </div>
      </div>

      <InputField label="Remarks (Optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

      <div className="flex justify-end mt-3">
        <Button disabled={refundTicket.isPending} onClick={submit}>
          Refund Ticket
        </Button>
      </div>
    </div>
  );
};

export default ScheduleTickets;

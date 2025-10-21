import { useOutletContext, useParams } from "react-router-dom";
import { useGetScheduleTickets } from "@/_lib/@react-client-query/schedule.ts";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDeabounce.ts";
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
import { formatCurrency } from "@/utils";
import { formatSectionName } from "@/utils/seatmap";

const statusOptions = [
  { name: "All Status", value: "all" },
  { name: "Sold", value: "sold" },
  { name: "Unsold", value: "unsold" },
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
  const { schedule } = useOutletContext<{ schedule: Schedule }>();
  const { scheduleId } = useParams();
  const { data: tickets, isLoading: loadingTickets, isError: errorTickets } = useGetScheduleTickets(scheduleId as string);
  const [filterValues, setFilterValues] = useState({ controlNumber: "", section: "all", status: "all", seatSection: "all" });
  const debouncedSearch = useDebounce(filterValues.controlNumber);
  const [page, setPage] = useState(1);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter((ticket) => {
      const matchStatus =
        filterValues.status === "all" ||
        (filterValues.status === "unsold" && !ticket.isRemitted) ||
        (filterValues.status === "sold" && ticket.isRemitted);

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
  }, [tickets, filterValues.section, filterValues.status, filterValues.controlNumber, filterValues.seatSection, debouncedSearch]);

  const paginatedTicket = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, page]);

  useEffect(() => {
    setPage(1);
  }, [filterValues.section, filterValues.status, debouncedSearch]);

  const summary = useMemo(() => {
    if (!tickets)
      return {
        total: 0,
        sold: 0,
        unsold: 0,
        allocated: 0,
        notAllocated: 0,
        regularTickets: 0,
        complimentary: 0,
      };

    const allocated = tickets.filter((t) => t.distributorId !== null).length;
    const notAllocated = tickets.filter((ticket) => !ticket.isComplimentary).length - allocated;
    const sold = tickets.filter((t) => t.isRemitted).length;
    const unsold = allocated - sold;
    const regularTickets = tickets.filter((t) => !t.isComplimentary).length;
    const complimentary = tickets.filter((t) => t.isComplimentary).length;

    return {
      total: tickets.length,
      sold,
      unsold,
      allocated,
      notAllocated,
      regularTickets,
      complimentary,
    };
  }, [tickets]);

  const ticketInformationSummaryData = [
    { name: "allocated", value: summary.allocated, fill: "hsl(var(--chart-1))" },
    { name: "not", value: summary.notAllocated, fill: "grey" },
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
    return <h1>Loading...</h1>;
  }

  if (!tickets || errorTickets || !summary) {
    return <h1>Error loading tickets</h1>;
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

        {/* <Card className="w-full h-fit">
          <CardHeader>
            <CardTitle>Ticket Distribution by Section</CardTitle>
            <CardDescription>Number of tickets per section (Balcony, Orchestra, Complimentary)</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card> */}
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
                    render: (ticket: Ticket) => formatSectionName(ticket.seatSection),
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
              render: (ticket) => (["sold", "remitted"].includes(ticket.status) ? "Sold" : ticket.status),
            },
            {
              key: "action",
              header: "Actions",
              headerClassName: "text-right",
              render: (ticket) => (
                <div className="flex gap-2 justify-end  items-center ">
                  <DialogPopup className="max-w-3xl" title="Ticket Information" triggerElement={<Button>View Ticket</Button>}>
                    <ViewTicket
                      status={ticket.status}
                      ticketPrice={ticket.ticketPrice}
                      scheduleId={scheduleId as string}
                      controlNumber={ticket.controlNumber}
                    />
                  </DialogPopup>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Settings2Icon />
                      </Button>
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
              ),
            },
          ]}
        />
      </div>
    </>
  );
};

export default ScheduleTickets;

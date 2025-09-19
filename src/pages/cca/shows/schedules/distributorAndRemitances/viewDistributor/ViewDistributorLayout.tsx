import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useGetAllocatedTicketsOfDistributor, useUnAllocateTicket } from "../../../../../../_lib/@react-client-query/schedule";
import type { ShowData } from "../../../../../../types/show";
import type { Schedule } from "../../../../../../types/schedule";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { formatCurrency } from "../../../../../../utils";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import { Separator } from "@/components/ui/separator";
import Modal from "@/components/Modal";
import UnallocateTicket from "./distributorActions/UnallocateTicket";
import RemitTickets from "./distributorActions/RemitTickets";
import UnRemitTickets from "./distributorActions/UnRemitTickets";
import { toast } from "sonner";
import { Label, Pie, PieChart, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Progress } from "@/components/ui/progress";

const links = [
  {
    name: "Ticket Overview",
    path: "",
  },
  {
    name: "Allocation Logs",
    path: "/allocation/history",
  },
  {
    name: "Remittance Logs",
    path: "/remittance/history",
  },
];

const ViewDistributorLayout = () => {
  const queryClient = useQueryClient();
  const unAllocateTicket = useUnAllocateTicket();
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const { schedule, show } = useOutletContext<{ show: ShowData; schedule: Schedule }>();
  const { distributorId, showId, scheduleId } = useParams();
  const { data, isLoading, isError } = useGetAllocatedTicketsOfDistributor(distributorId as string, scheduleId as string);

  const [isUnallocateTicket, setIsUnallocateTicket] = useState(false);
  const [isRemitTicket, setIsRemitTicket] = useState(false);
  const [isUnRemitTicket, setIsUnRemitTicket] = useState(false);

  const summary = useMemo(() => {
    if (!data)
      return {
        totalAllocatedTickets: 0,
        soldTickets: 0,
        unsoldTickets: 0,
        remittedTickets: 0,
        pendingRemittance: 0,
        expected: 0,
        remitted: 0,
        balanceDue: 0,
      };

    const totalAllocatedTickets = data.length;
    const soldTickets = data.filter((ticket) => ticket.status == "sold" || ticket.isRemitted).length;
    const unsoldTickets = totalAllocatedTickets - soldTickets;
    const remittedTickets = data.filter((ticket) => ticket.isRemitted).length;

    const pendingRemittance = soldTickets - remittedTickets;
    const expected = data.reduce<number>((acc, ticket) => acc + (Number(ticket.ticketPrice) - schedule.commissionFee), 0);
    const remitted = data
      .filter((ticket) => ticket.isRemitted)
      .reduce<number>((acc, ticket) => acc + (Number(ticket.ticketPrice) - schedule.commissionFee), 0);
    const balanceDue = expected - remitted;

    return { totalAllocatedTickets, soldTickets, unsoldTickets, remittedTickets, pendingRemittance, expected, remitted, balanceDue };
  }, [data]);

  const ticketsChartConfig = {
    sold: {
      label: "Sold Tickets",
    },
    unsold: {
      label: "Unsold Tickets",
    },
  } satisfies ChartConfig;

  const remittanceChartConfig = {
    verified: {
      label: "Verified Remittance",
    },
    pending: {
      label: "Pending Remittance",
    },
  } satisfies ChartConfig;

  const ticketsChartData = [
    { name: "sold", value: summary.soldTickets, fill: "hsl(var(--chart-1))" },
    { name: "unsold", value: summary.unsoldTickets, fill: "hsl(var(--chart-2))" },
  ];

  const remittanceChartData = [
    { name: "verified", value: summary.remittedTickets, fill: "hsl(var(--chart-1))" },
    { name: "pending", value: summary.pendingRemittance, fill: "hsl(var(--chart-2))" },
  ];

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  if (!data[0]) {
    navigate(`/shows/schedule/${showId}/${scheduleId}/d&r/`);
  }

  const distributorName = data[0]?.distributor;

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Breadcrumbs
        backHref={`/shows/schedule/${showId}/${scheduleId}/d&r/`}
        items={[{ name: "Distributor List", href: `/shows/schedule/${showId}/${scheduleId}/d&r/` }, { name: distributorName }]}
      />
      <div className="flex flex-col gap-5 ">
        <h1 className="text-2xl">{distributorName}</h1>
        <div className="flex gap-3 items-center">
          {/* <Button className="!bg-green">Allocate Ticket</Button> */}
          <Button onClick={() => setIsUnallocateTicket(true)} variant="destructive">
            Unallocate Ticket
          </Button>
          <Button onClick={() => setIsRemitTicket(true)} className="bg-primary">
            Remit Tickets
          </Button>
          <Button onClick={() => setIsUnRemitTicket(true)}> Unremit Tickets</Button>
        </div>
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Sale Progress</CardTitle>
              <CardDescription>Shows the amount of expected sale and that have been remitted</CardDescription>
              <CardContent className="p-0">
                <div className="flex w-fit items-center justify-between gap-2">
                  <p>Expected: {formatCurrency(summary.expected)}</p>
                  <p>Remitted: {formatCurrency(summary.remitted)}</p>
                </div>
                <Progress value={summary.expected ? (summary.remitted / summary.expected) * 100 : 0} className="h-4 rounded-full w-full mt-2" />
              </CardContent>
            </CardHeader>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Card>
              <CardHeader>
                <CardTitle>Sold & Unsold Tickets</CardTitle>
                <CardDescription> Visual representation of sold and unsold tickets for this distributor</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={ticketsChartConfig} className="mx-auto aspect-square max-h-[250px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={ticketsChartData}
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
                                  {summary.totalAllocatedTickets}
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
            <Card>
              <CardHeader>
                <CardTitle>Remittance Overview</CardTitle>
                <CardDescription className="max-w-md">
                  Shows the number of tickets that have been remitted versus those still pending for this distributor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={remittanceChartConfig} className="mx-auto aspect-square max-h-[250px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={remittanceChartData}
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
                                  {summary.soldTickets}
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                  Total Sold Tickets
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
        </div>
      </div>
      <Separator />
      <div className="mb-5 flex gap-5">
        {links.map((link, index) => (
          <NavLink
            key={index}
            end={link.path == ""}
            className={({ isActive }) => (isActive ? "font-semibold" : "font-normal text-lightGrey")}
            to={`/shows/schedule/${showId}/${scheduleId}/d&r/${distributorId}${link.path}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      <div>
        <Outlet context={{ allocatedTickets: data, schedule, show }} />
      </div>

      {isUnallocateTicket && (
        <Modal
          description={`Distributor: ${distributorName}`}
          title="Unallocate Ticket"
          isOpen={isUnallocateTicket}
          onClose={() => setIsUnallocateTicket(false)}
        >
          <UnallocateTicket
            controlNumbersAllocated={data
              .filter((ticket) => !ticket.isRemitted && ticket.status === "allocated")
              .map((ticket) => ticket.controlNumber)}
            close={() => setIsUnallocateTicket(false)}
            disabled={unAllocateTicket.isPending}
            onSubmit={(controlNumbers) => {
              const payload = {
                distributorId: distributorId as string,
                scheduleId: scheduleId as string,
                unallocatedBy: user?.userId as string,
                controlNumbers,
              };

              toast.promise(
                unAllocateTicket.mutateAsync(payload).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["schedule", "allocated", scheduleId, distributorId], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["schedule", "seatmap", scheduleId], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId] });
                  setIsUnallocateTicket(false);
                }),
                {
                  position: "top-center",
                  loading: "Unallocating ticket...",
                  success: "Tickets Unallocated",
                  error: (err: any) => err.message || "Failed to unallocate ticket",
                }
              );
            }}
            schedule={schedule}
            show={show}
            distributorName={distributorName}
          />
        </Modal>
      )}

      {isRemitTicket && (
        <Modal className="max-w-2xl" title="Remit Ticket Sales" isOpen={isRemitTicket} onClose={() => setIsRemitTicket(false)}>
          <RemitTickets closeRemit={() => setIsRemitTicket(false)} distributorData={data} />
        </Modal>
      )}

      {isUnRemitTicket && (
        <Modal className="max-w-2xl" title="Unremit Ticket Sales" isOpen={isUnRemitTicket} onClose={() => setIsUnRemitTicket(false)}>
          <UnRemitTickets distributorData={data} closeModal={() => setIsUnRemitTicket(false)} />
        </Modal>
      )}
    </div>
  );
};

export default ViewDistributorLayout;

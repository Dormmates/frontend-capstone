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
import Loading from "@/components/Loading";
import Error from "@/components/Error";

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
    name: "Payment Logs",
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
    const soldTickets = data.filter((ticket) => ticket.status == "sold" || ticket.isPaid || ticket.status === "remitted").length;
    const unsoldTickets = totalAllocatedTickets - soldTickets;
    const remittedTickets = data.filter((ticket) => ticket.isPaid || ticket.status === "remitted").length;

    const pendingRemittance = totalAllocatedTickets - remittedTickets;
    const expected = data.reduce<number>(
      (acc, ticket) => acc + (Number(ticket.ticketPrice) - (schedule.ticketPricing ? schedule.ticketPricing.commissionFee : 0)),
      0
    );
    const remitted = data
      .filter((ticket) => ticket.isPaid)
      .reduce<number>((acc, ticket) => acc + (Number(ticket.ticketPrice) - (schedule.ticketPricing ? schedule.ticketPricing.commissionFee : 0)), 0);
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
      label: "Paid To CCA",
    },
    pending: {
      label: "Pending for payment",
    },
  } satisfies ChartConfig;

  const ticketsChartData = [
    { name: "sold", value: summary.soldTickets, fill: "hsl(122 42.2% 45.8%)" },
    { name: "unsold", value: summary.unsoldTickets, fill: "hsl(0 54.2% 45.8%)" },
  ];

  const remittanceChartData = [
    { name: "verified", value: summary.remittedTickets, fill: "hsl(122 42.2% 45.8%)" },
    { name: "pending", value: summary.pendingRemittance, fill: "hsl(0 54.2% 45.8%)" },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (!data || isError) {
    return <Error />;
  }

  if (!data[0]) {
    navigate(`/shows/schedule/${showId}/${scheduleId}/d&r/`);
  }

  const distributorName = data[0]?.distributor;

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Breadcrumbs
        backHref={`/shows/schedule/${showId}/${scheduleId}/d&r/`}
        items={[
          {
            name: "Distributor List",
            href: `/shows/schedule/${showId}/${scheduleId}/d&r/`,
          },
          { name: distributorName },
        ]}
      />
      <div className="flex flex-col gap-5 ">
        <h1 className="text-2xl">{distributorName}</h1>
        {(user?.roles.includes("head") || show.showType !== "majorProduction") && (
          <div className="flex flex-col gap-3 md:items-center md:flex-row">
            <>
              <Button disabled={!schedule.isOpen || show.isArchived} onClick={() => setIsRemitTicket(true)} className="bg-primary">
                Receive Distributor Payment
              </Button>
              <Button variant="secondary" disabled={!schedule.isOpen || show.isArchived} onClick={() => setIsUnRemitTicket(true)}>
                Revert Distributor Payment
              </Button>
              <Button disabled={!schedule.isOpen || show.isArchived} onClick={() => setIsUnallocateTicket(true)} variant="outline">
                Unallocate Ticket
              </Button>
            </>
          </div>
        )}

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Sale Progress</CardTitle>
              <CardDescription>Shows the amount of expected sale and that have been paid to CCA</CardDescription>
              <CardContent className="p-0">
                <div className="flex w-fit items-center justify-between gap-2">
                  <p>Expected: {formatCurrency(summary.expected)}</p>
                  <p>Paid: {formatCurrency(summary.remitted)}</p>
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
                                  Allocated Tickets
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
                <CardTitle>Payment Overview</CardTitle>
                <CardDescription className="max-w-md">
                  Shows the number of tickets that have been paid versus those still pending for this distributor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {remittanceChartData.every((s) => s.value == 0) ? (
                  <div className="flex items-center justify-center border rounded-md  h-[250px] text-muted-foreground">
                    Distributor have no remittance data
                  </div>
                ) : (
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
                      />
                    </PieChart>
                  </ChartContainer>
                )}
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
          className="max-w-5xl max-h-[98%] overflow-auto"
          description={`Distributor: ${distributorName}`}
          title="Unallocate Ticket"
          isOpen={isUnallocateTicket}
          onClose={() => setIsUnallocateTicket(false)}
        >
          <UnallocateTicket
            controlNumbersAllocated={data.filter((ticket) => !ticket.isPaid && ticket.status === "allocated").map((ticket) => ticket.controlNumber)}
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
        <Modal
          className="max-w-5xl max-h-[98%] overflow-auto"
          title="Receive Distributor Payment"
          isOpen={isRemitTicket}
          onClose={() => setIsRemitTicket(false)}
        >
          <RemitTickets closeRemit={() => setIsRemitTicket(false)} distributorData={data} />
        </Modal>
      )}

      {isUnRemitTicket && (
        <Modal
          className="max-w-5xl max-h-[98%] overflow-auto"
          title="Revert Distributor Payment"
          isOpen={isUnRemitTicket}
          onClose={() => setIsUnRemitTicket(false)}
        >
          <UnRemitTickets distributorData={data} closeModal={() => setIsUnRemitTicket(false)} />
        </Modal>
      )}
    </div>
  );
};

export default ViewDistributorLayout;

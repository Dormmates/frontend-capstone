import { useMemo, useState } from "react";
import { useGetShowsAndDistributorTickets } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import type { DistributorScheduleTickets } from "@/types/ticket.ts";
import ViewAllocatedTickets from "./ViewAllocatedTickets";
import { formatCurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

const calculateRemittanceAmount = (schedule: DistributorScheduleTickets) => {
  const soldTickets = schedule.tickets.filter((ticket) => ticket.status === "sold");
  const totalSales = soldTickets.reduce((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
  const commission = soldTickets.length * (Number(schedule.commissionFee) || 0);
  const amountRemitted = schedule.tickets
    .filter((ticket) => ticket.isPaid)
    .reduce((acc, curr) => (acc += curr.ticketPrice - (Number(schedule.commissionFee) || 0)), 0);
  const amountToRemit = totalSales - commission;

  return { totalSales, commission, amountToRemit, amountRemitted };
};

const DistributorDashboard = () => {
  const { user } = useAuthContext();
  const { data, isLoading, isError } = useGetShowsAndDistributorTickets(user?.userId as string);

  const summary = useMemo(() => {
    if (!data) return { allocatedTickets: 0, soldTickets: 0, unsoldTickets: 0 };

    const allocatedTickets = data.reduce((acc, cur) => acc + cur.tickets.length, 0);
    const soldTickets = data.reduce((acc, cur) => acc + cur.tickets.filter((ticket) => ticket.status === "sold" || ticket.isPaid).length, 0);
    const unsoldTickets = allocatedTickets - soldTickets;

    return { allocatedTickets, soldTickets, unsoldTickets };
  }, [data]);

  const [selectedSchedule, setSelectedSchedule] = useState<DistributorScheduleTickets | null>(null);

  const ticketsChartConfig = {
    sold: {
      label: "Sold Tickets",
    },
    unsold: {
      label: "Unsold Tickets",
    },
  } satisfies ChartConfig;

  const ticketsChartData = [
    { name: "sold", value: summary.soldTickets, fill: "hsl(122 42.2% 45.8%)" },
    { name: "unsold", value: summary.unsoldTickets, fill: "hsl(0 54.2% 45.8%)" },
  ];

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error fetching</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="font-bold text-4xl">Welcome, {user?.firstName + " " + user?.lastName}</h1>

      <div className="flex flex-col mt-10">
        <p className="text-xl">Shows and show schedules that have tickets allocated to you</p>
        <div className="flex gap-3 my-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall Ticket Distribution</CardTitle>
              <CardDescription>Show the distribution of Sold and Unsold tickets by Distributor</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsChartData.every((d) => d.value === 0) ? (
                <div className="flex items-center justify-center border text-sm p-10 rounded-md">No Data Found.</div>
              ) : (
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
                                  {summary.allocatedTickets}
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
              )}
            </CardContent>
          </Card>
        </div>

        <PaginatedTable
          className="min-w-[1200px]"
          data={data}
          columns={[
            {
              key: "title",
              header: "Show Title",
              render: (schedule) => (
                <div className="flex items-center gap-2">
                  <img className="w-5" src={schedule.show.showCover} alt="cover" />
                  <p>{schedule.show.title}</p>
                </div>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (schedule) => formatToReadableDate(schedule.datetime + ""),
            },
            {
              key: "time",
              header: "Time",
              render: (schedule) => formatToReadableTime(schedule.datetime + ""),
            },
            {
              key: "tickets",
              header: "Tickets Allocated",
              render: (schedule) => schedule.tickets.length,
            },
            {
              key: "remitted",
              header: "Paid Tickets",
              render: (schedule) => schedule.tickets.filter((ticket) => ticket.isPaid).length,
            },
            {
              key: "amountRemitted",
              header: "Amount Paid",
              render: (schedule) => {
                const { amountRemitted } = calculateRemittanceAmount(schedule);
                return formatCurrency(amountRemitted);
              },
            },
            {
              key: "amount",
              header: "Pending Payment",
              render: (schedule) => {
                const { amountToRemit } = calculateRemittanceAmount(schedule);
                return formatCurrency(amountToRemit);
              },
            },
            {
              key: "action",
              header: "Actions",
              render: (schedule) => (
                <Button onClick={() => setSelectedSchedule(schedule)} variant="outline">
                  View Tickets
                </Button>
              ),
            },
          ]}
        />
      </div>

      {selectedSchedule && (
        <Modal
          className="w-[97%] max-w-[1000px] overflow-y-auto max-h-[90%] "
          isOpen={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          title="Tickets Allocated"
        >
          <ViewAllocatedTickets closeModal={() => setSelectedSchedule(null)} schedule={selectedSchedule} />
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default DistributorDashboard;

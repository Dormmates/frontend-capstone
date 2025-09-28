import { Link, useParams } from "react-router-dom";
import { useGetScheduleSummary } from "@/_lib/@react-client-query/schedule.ts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LabelList, Pie, PieChart } from "recharts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import SimpleCard from "@/components/SimpleCard";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils";
import PaginatedTable from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";

const ScheduleSummary = () => {
  const { scheduleId, showId } = useParams();
  // const { show, schedule } = useOutletContext<{ show: ShowData; schedule: Schedule }>();
  const { data: summary, isLoading: loadingSummary, isError: summaryError } = useGetScheduleSummary(scheduleId as string);

  if (loadingSummary) {
    return <h1>Loading...</h1>;
  }

  if (!summary || summaryError) {
    return <h1>Error loading</h1>;
  }

  const ticketsChartData = [
    { ticket: "complimentary", value: summary.ticketsSummary.complimentary, fill: "hsl(var(--chart-5))" },
    { ticket: "orchestra", value: summary.ticketsSummary.orchestraTickets.total, fill: "hsl(var(--chart-3))" },
    { ticket: "balcony", value: summary.ticketsSummary.balconyTickets.total, fill: "hsl(var(--chart-1))" },
  ];

  const ticketsChartDataConfig = {
    value: {
      label: "Ticket Count:",
    },
    complimentary: {
      label: "Complimentary Tickets",
    },
    orchestra: {
      label: "Orchestra Tickets",
    },
    balcony: {
      label: "Balcony Tickets",
    },
  } satisfies ChartConfig;

  const ticketSectionChartData = [
    { ticket: "orchestra", sold: summary.ticketsSummary.orchestraTickets.sold, unsold: summary.ticketsSummary.orchestraTickets.remaining },
    { ticket: "balcony", sold: summary.ticketsSummary.balconyTickets.sold, unsold: summary.ticketsSummary.balconyTickets.remaining },
  ];

  console.log(summary);

  return (
    <>
      <h1 className="text-2xl">Schedule Summary</h1>

      {/* <Card>
        <CardHeader>
          <CardTitle>Schedule Information Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col gap-2">
            <p>Show Title: {show.title}</p>
            <p>
              Schedule: {formatToReadableDate(schedule.datetime + "")} at {formatToReadableTime(schedule.datetime + "")}
            </p>
            <p>Seating Type: {schedule.seatingType}</p>
          </div>

          <div>
            {summary.schedulePrices?.ticketPrice && (
              <FixedPrice
                data={
                  {
                    id: "asv",
                    type: "fixed",
                    priceName: "Ticket Price",
                    commisionFee: schedule.commissionFee,
                    fixedPrice: summary.schedulePrices.ticketPrice,
                  } as FixedPricing
                }
                hideAction={true}
              />
            )}

            {summary.schedulePrices?.ticketPricesBySection && (
              <SectionedPrice
                data={
                  {
                    id: "njkasvnjasv",
                    type: "sectioned",
                    sectionPrices: {
                      orchestraLeft: summary.schedulePrices.ticketPricesBySection.orchestraLeft,
                      orchestraMiddle: summary.schedulePrices.ticketPricesBySection.orchestraMiddle | 0,
                      orchestraRight: summary.schedulePrices.ticketPricesBySection.orchestraRight,
                      balconyLeft: summary.schedulePrices.ticketPricesBySection.balconyLeft,
                      balconyMiddle: summary.schedulePrices.ticketPricesBySection.balconyMiddle,
                      balconyRight: summary.schedulePrices.ticketPricesBySection.balconyRight,
                    },
                    priceName: "Ticket Price",
                    commisionFee: schedule.commissionFee,
                  } as SectionedPricing
                }
                hideAction={true}
              />
            )}
          </div>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Sales Progress ({((summary.salesSummary.current / summary.salesSummary.expected) * 100).toFixed(2)}%)</CardTitle>

          <CardDescription>Current vs expected ticket sales</CardDescription>
          <CardContent className="p-0">
            <Progress value={(summary.salesSummary.current / summary.salesSummary.expected) * 100} />
            <div className="mt-5">
              <p>Expected: {formatCurrency(summary.salesSummary.expected)}</p>
              <p>Current: {formatCurrency(summary.salesSummary.current)}</p>
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-2 gap-6 w-full">
        {/*Tickets Overview */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap w-fit gap-5">
            <div className="grid grid-cols-2  md:grid-cols-4 gap-2">
              <SimpleCard label="Total Tickets" value={summary.ticketsSummary.total} />
              <SimpleCard label="Orchestra Tickets" value={summary.ticketsSummary.orchestraTickets.total} />
              <SimpleCard label="Balcony Tickets" value={summary.ticketsSummary.balconyTickets.total} />
              <SimpleCard label="Complimentary Tickets" value={summary.ticketsSummary.complimentary} />
            </div>
            <div className="grid xl:grid-cols-2 w-full gap-5  items-center">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Distribution by Category</CardTitle>
                  <CardDescription>Breakdown of Orchestra, Balcony, and Complimentary tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={ticketsChartDataConfig} className="[&_.recharts-text]:fill-background mx-auto aspect-square h-[300px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                      <Pie data={ticketsChartData} dataKey="value">
                        <LabelList
                          dataKey="ticket"
                          className="fill-background"
                          stroke="none"
                          fontSize={12}
                          formatter={(value: keyof typeof ticketsChartDataConfig) => ticketsChartDataConfig[value]?.label}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sold vs Remaining by Section</CardTitle>
                  <CardDescription>Visual comparison of sold and unsold tickets for Orchestra and Balcony.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="mx-auto aspect-square h-[300px] w-full" config={ticketsChartDataConfig}>
                    <BarChart accessibilityLayer data={ticketSectionChartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="ticket"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => String(value).toUpperCase()}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                      <Bar dataKey="sold" fill="hsl(var(--chart-1))" radius={4} minPointSize={3} />
                      <Bar dataKey="unsold" fill="hsl(var(--chart-2))" radius={4} minPointSize={3} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/*Distributors */}
        <Card className="overflow-x-auto h-fit">
          <CardHeader>
            <CardTitle>Distributors</CardTitle>
            <CardDescription>ashakjvnakjsvnkavnkajsvkav</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Total Distributors: {summary.distributorSummary.distributors.length}</Label>
            <PaginatedTable
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (distributor) => distributor.firstName + " " + distributor.lastName,
                },
                {
                  key: "allocated",
                  header: "Allocated",
                  render: (distributor) => distributor.totalAllocatedTickets,
                },
                {
                  key: "sold",
                  header: "Sold",
                  render: (distributor) => distributor.soldTickets,
                },
                {
                  key: "unsold",
                  header: "Unsold",
                  render: (distributor) => distributor.unsoldTickets,
                },
                {
                  key: "expected",
                  header: "Expected Sales",
                  render: (distributor) => <span>{formatCurrency(distributor.expected)}</span>,
                },
                {
                  key: "remitted",
                  header: "Remitted",
                  render: (distributor) => <span>{formatCurrency(distributor.remitted)}</span>,
                },
                {
                  key: "balance",
                  header: "Balance Due",
                  render: (distributor) => <span>{formatCurrency(distributor.balanceDue)}</span>,
                },
                {
                  key: "action",
                  header: "Action",
                  headerClassName: "text-end",
                  render: (distributor) => (
                    <div className="flex justify-end">
                      <div className="flex justify-end">
                        <Link to={`/shows/schedule/${showId}/${scheduleId}/d&r/${distributor.userId}`}>
                          <Button variant="outline">View Distributor</Button>
                        </Link>
                      </div>
                    </div>
                  ),
                },
              ]}
              data={summary.distributorSummary.distributors}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground flex gap-2">
              Total Tickets Allocated to all Distributors:
              <span className="font-bold text-foreground">{summary.distributorSummary.distributorsTotal.allocated}</span>
            </p>
            <p className="text-sm text-muted-foreground flex gap-2">
              Total Tickets Sold by all Distributors:
              <span className="font-bold text-foreground">{summary.distributorSummary.distributorsTotal.sold}</span>
            </p>
            <p className="text-sm text-muted-foreground flex gap-2">
              Total Tickets Unsold by all Distributors:
              <span className="font-bold text-foreground">{summary.distributorSummary.distributorsTotal.unsold}</span>
            </p>
            <p className="text-sm text-muted-foreground flex gap-2">
              Total Amount Remitted by all Distributors:
              <span className="font-bold text-foreground">{formatCurrency(summary.distributorSummary.distributorsTotal.remitted)}</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ScheduleSummary;

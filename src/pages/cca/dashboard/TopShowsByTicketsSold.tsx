import { useGetTopShowsByTicketsSold } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

type TopShowsByTicketsSoldProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const TopShowsByTicketsSold = ({ isHead, selectedDepartment }: TopShowsByTicketsSoldProps) => {
  const {
    data: topShows,
    isLoading,
    isError,
  } = useGetTopShowsByTicketsSold({
    departmentId: isHead && selectedDepartment == "all" ? undefined : selectedDepartment,
  });

  const chartData = useMemo(() => {
    if (!topShows) return [];
    return topShows.map((show, index) => ({
      name: `${show.showTitle} - ${show.department ?? ""} (${show.showType.toUpperCase()})`,
      sold: show.soldTickets,
      fill: `hsl(var(--chart-${5 - index}))`,
    }));
  }, [topShows]);

  const chartConfig = {
    sold: {
      label: "Total Sold Tickets",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <p>Top Shows by Tickets Sold</p>
          </CardTitle>
          <CardDescription>Visual comparison of ticket sales per show.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <p>Top Shows by Tickets Sold</p>
          </div>
        </CardTitle>
        <CardDescription>Based on total remitted ticket sales.</CardDescription>
      </CardHeader>

      <CardContent>
        {isError || chartData.length == 0 ? (
          <div className="border flex items-center justify-center rounded-md p-5 text-sm text-foreground h-20">No Data Available.</div>
        ) : (
          <ChartContainer className="mx-auto aspect-square h-[250px] w-full" config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="sold" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Bar maxBarSize={50} dataKey="sold" layout="vertical" radius={4}>
                <LabelList dataKey="name" position="insideLeft" offset={8} className="fill-white font-bold" fontSize={12} />
                <LabelList dataKey="sold" position="right" offset={8} className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        {topShows && topShows.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            <strong>{topShows[0].showTitle}</strong> leads with {topShows[0].soldTickets.toLocaleString()} tickets sold.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default TopShowsByTicketsSold;

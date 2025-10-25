import { useGetTopGenres, type TopGenres } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { formatCurrency } from "@/utils";
import PaginatedTable from "@/components/PaginatedTable";

type TopShowsByGenreProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const TopShowsByGenre = ({ isHead, selectedDepartment }: TopShowsByGenreProps) => {
  const [selectedGenre, setSelectedGenre] = useState<TopGenres | null>(null);

  const {
    data: topGenres,
    isLoading,
    isError,
  } = useGetTopGenres({
    departmentId: isHead && selectedDepartment == "all" ? undefined : selectedDepartment,
  });

  const chartData = useMemo(() => {
    if (!topGenres) return [];
    return topGenres.map((genre) => ({
      ...genre,
      name: genre.genre,
      sold: genre.totalRevenue,
      fill: `hsl(var(--chart-3))`,
    }));
  }, [topGenres]);

  const chartConfig = {
    sold: {
      label: "Total Generated Revenue",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <p>Top Genres by Ticket Sales</p>
          </CardTitle>
          <CardDescription>Based on total remitted revenue per genre.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <p> Top Genres by Ticket Sales</p>
          </CardTitle>
          <CardDescription>Based on total remitted revenue per genre.</CardDescription>
        </CardHeader>

        <CardContent>
          {isError || chartData.length == 0 ? (
            <div className="border flex items-center justify-center rounded-md p-5 text-sm text-foreground h-20">No Data Available.</div>
          ) : (
            <ChartContainer className="mx-auto aspect-square h-[350px] w-full" config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                  left: 40,
                }}
              >
                <XAxis type="number" dataKey="sold" hide />
                <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar
                  cursor="pointer"
                  onClick={(data) => setSelectedGenre(data.payload)}
                  activeBar={{ fill: "hsl(var(--chart-1))" }}
                  dataKey="sold"
                  radius={5}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter>
          {topGenres && topGenres.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              The <strong>{topGenres[0].genre}</strong> genre generated the highest total revenue of {formatCurrency(topGenres[0].totalRevenue)}.
            </p>
          )}
        </CardFooter>
      </Card>

      {selectedGenre && (
        <Modal className="max-w-4xl" isOpen={!!selectedGenre} onClose={() => setSelectedGenre(null)} title={`${selectedGenre.genre} - Genre Summary`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Tickets Sold</p>
                <p className="font-medium">{selectedGenre.totalTickets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Revenue</p>
                <p className="font-medium">{formatCurrency(selectedGenre.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Commission</p>
                <p className="font-medium">{formatCurrency(selectedGenre.totalCommission)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-2 text-sm">Shows under this genre:</p>
              <PaginatedTable
                data={selectedGenre.shows}
                columns={[
                  {
                    key: "showTitle",
                    header: "Show Title",
                    render: (show) => show.title,
                  },
                  {
                    key: "type",
                    header: "Production Type",
                    render: (show) => show.showType.toUpperCase(),
                  },
                  {
                    key: "department",
                    header: "Department",
                    render: (show) => show.department,
                  },
                  {
                    key: "tickets",
                    header: "Total Tickets Sold",
                    render: (show) => show.totalTickets,
                  },
                  {
                    key: "commission",
                    header: "Total Commission",
                    render: (show) => formatCurrency(show.totalCommission),
                  },
                  {
                    key: "revenue",
                    header: "Total Sales",
                    render: (show) => formatCurrency(show.totalRevenue),
                  },
                ]}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TopShowsByGenre;

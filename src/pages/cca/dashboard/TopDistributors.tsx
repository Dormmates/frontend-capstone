import { useGetTopDistributors } from "@/_lib/@react-client-query/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DataTable } from "@/components/DataTable";
import { formatCurrency } from "@/utils";
import top1Icon from "@/assets/icons/top1.png";
import trophy from "@/assets/icons/award.png";
import trophy2 from "@/assets/icons/2nd.png";
import trophy3 from "@/assets/icons/3rd.png";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Link } from "react-router-dom";

type TopDistributorsProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const TopDistributors = ({ isHead, selectedDepartment }: TopDistributorsProps) => {
  const { user } = useAuthContext();

  const {
    data: topDistributors,
    isLoading: loadingTopDistributors,
    isError: errorDistributors,
  } = useGetTopDistributors({
    departmentId: !isHead && user?.department ? user.department.departmentId : selectedDepartment == "all" ? undefined : selectedDepartment,
  });

  if (loadingTopDistributors) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <p>{!isHead && user?.department && user.department.name} Top Distributors</p>
            </div>
          </CardTitle>
          <CardDescription>Shows the top-performing distributors calculated from cumulative remitted ticket sales.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  console.log(topDistributors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <p>{!isHead && user?.department && user.department.name} Top Distributors</p>
          </div>
        </CardTitle>
        <CardDescription>Shows the top-performing distributors calculated from cumulative remitted ticket sales.</CardDescription>
      </CardHeader>
      <CardContent>
        {(!topDistributors || errorDistributors) && <h1>Failed to load top Distributors</h1>}

        {topDistributors && (
          <DataTable
            data={topDistributors}
            columns={[
              {
                key: "rank",
                header: "Rank",
                render: (_, index) => (
                  <span
                    className={`font-semibold ${
                      index === 0
                        ? "text-primary font-bold text-2xl"
                        : index === 1
                        ? "text-orange-400 font-medium text-xl"
                        : index === 2
                        ? "text-amber-700 text-lg"
                        : ""
                    }`}
                  >
                    {index === 0 && <img className="w-10 h-10" src={trophy} alt="1" />}
                    {index === 1 && <img className="w-8 h-8" src={trophy2} alt="2" />}
                    {index === 2 && <img className="w-6 h-6" src={trophy3} alt="3" />}
                    {index > 2 && index + 1}
                  </span>
                ),
              },
              {
                key: "name",
                header: "Distributor Name",
                render: (distributor) => distributor.fullName,
              },
              {
                key: "totalTickets",
                header: "Tickets Sold",
                render: (distributor) => distributor.totalTickets,
              },
              {
                key: "totalCommission",
                header: "Total Commission",
                render: (distributor) => formatCurrency(distributor.totalCommission),
              },
              {
                key: "totalNetRevenue",
                header: "Net Revenue",
                render: (distributor) => formatCurrency(distributor.totalNetRevenue),
              },
              {
                key: "actions",
                header: "",
                render: (distributor, index) => (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="flex gap-2 items-center">
                          {index === 0 ? <img src={top1Icon} className="w-8" /> : <p>{index + 1}.</p>}

                          <p>
                            {distributor.fullName} ({distributor.department && distributor.department})
                          </p>
                        </SheetTitle>
                        <SheetDescription>Distributor performance summary and breakdown by show.</SheetDescription>
                      </SheetHeader>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Distributor Type</p>
                          <p className="font-medium uppercase">{distributor.distributorType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Tickets Sold</p>
                          <p className="font-medium">{distributor.totalTickets}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Commission Received</p>
                          <p className="font-medium">{formatCurrency(distributor.totalCommission)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Revenue</p>
                          <p className="font-medium">{formatCurrency(distributor.totalNetRevenue)}</p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <h3 className="text-base font-semibold">Show Breakdown</h3>
                        {distributor.shows.map((show) => (
                          <div key={show.showId} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{show.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{show.showType}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">{show.departmentName}</p>
                            </div>
                            <div className="mt-2 border-t pt-3 space-y-3 text-sm">
                              {show.schedules.map((sched) => (
                                <div key={sched.scheduleId} className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/10">
                                  <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatToReadableDate(sched.dateTime)}</p>
                                  </div>

                                  <div>
                                    <p className="text-muted-foreground">Time</p>
                                    <p className="font-medium">{formatToReadableTime(sched.dateTime)}</p>
                                  </div>

                                  <div>
                                    <p className="text-muted-foreground">Sold</p>
                                    <p className="font-medium">{sched.ticketsSold}</p>
                                  </div>

                                  <div>
                                    <p className="text-muted-foreground">Commission</p>
                                    <p className="font-medium">{formatCurrency(sched.commission)}</p>
                                  </div>

                                  <div>
                                    <p className="text-muted-foreground">Sales</p>
                                    <p className="font-medium">{formatCurrency(sched.net)}</p>
                                  </div>

                                  <div className="">
                                    <Link to={`/shows/schedule/${show.showId}/${sched.scheduleId}/d&r/${distributor.userId}`}>
                                      <Button size="sm" variant="secondary">
                                        Open
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                ),
              },
            ]}
          />
        )}
      </CardContent>
      <CardFooter>
        {topDistributors && topDistributors.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            <strong>{topDistributors[0].fullName}</strong> currently leads with {formatCurrency(topDistributors[0].totalNetRevenue)} in total net
            revenue.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No distributor performance data available.</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default TopDistributors;

import { useGetUpcomingShows } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import PaginatedTable from "@/components/PaginatedTable";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";
import { addMonths } from "date-fns";
import DateRangeSelector from "@/components/DateRangeSelector";

type UpcomingShowsProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const UpcomingShows = ({ isHead, selectedDepartment }: UpcomingShowsProps) => {
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: addMonths(new Date(), 1),
  });

  const { data, isLoading, isError } = useGetUpcomingShows({
    departmentId: isHead && selectedDepartment == "all" ? undefined : selectedDepartment,
    from: range.from?.toISOString(),
    to: range.to?.toISOString(),
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <p>Upcoming shows</p>
          </CardTitle>
          <CardDescription>
            Displays shows scheduled from {formatToReadableDate(range.from + "")} to {formatToReadableDate(range.to + "")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <p>Upcoming shows</p>
            <DateRangeSelector value={range} onChange={setRange} />
          </div>
        </CardTitle>
        <CardDescription>
          Displays shows scheduled from {formatToReadableDate(range.from + "")} to {formatToReadableDate(range.to + "")}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError || !data ? (
          <div className="border flex items-center justify-center rounded-md p-5 text-sm text-foreground h-20">
            No Upcoming Shows scheduled from {formatToReadableDate(range.from + "")} to {formatToReadableDate(range.to + "")}.
          </div>
        ) : (
          <PaginatedTable
            emptyMessage={`No Upcoming Shows scheduled from ${formatToReadableDate(range.from + "")} to ${formatToReadableDate(range.to + "")}.`}
            data={data}
            columns={[
              {
                key: "title",
                header: "Show Title",
                render: (show) => show.title,
              },
              {
                key: "type",
                header: "Production Type",
                render: (show) => show.showType.toUpperCase(),
              },
              {
                key: "group",
                header: "Performing Group",
                render: (show) => show.department,
              },
              {
                key: "genres",
                header: "Genres",
                render: (show) => (
                  <span>
                    {show.genres.slice(0, 3).join(", ")}{" "}
                    {show.genres.length > 3 && <span className="text-sm text-muted-foreground">{`+ ${show.genres.length - 3} more`}</span>}
                  </span>
                ),
              },
              {
                key: "total",
                header: "Upcoming Schedule",
                render: (show) => show.totalUpcomingSchedules,
              },
              {
                key: "earliest",
                header: "Earliest Schedule",
                render: (show) => (
                  <span>
                    {formatToReadableDate(show.earliestSchedule)} at {formatToReadableTime(show.earliestSchedule)}
                  </span>
                ),
              },
              {
                key: "earliest",
                header: "",
                render: (show) => (
                  <Link to={`/shows/${show.showId}`}>
                    <Button size="sm">View Show</Button>
                  </Link>
                ),
              },
            ]}
          />
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground mt-2">
          {data && data.length > 0
            ? `${data.length} upcoming show${data.length > 1 ? "s" : ""} scheduled.`
            : "No upcoming shows currently scheduled."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default UpcomingShows;

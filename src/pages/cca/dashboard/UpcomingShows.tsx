import { useGetUpcomingShows } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";
import { useState } from "react";
import PaginatedTable from "@/components/PaginatedTable";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";

type UpcomingShowsProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const getRangeLabel = (days: number) => {
  switch (days) {
    case 7:
      return "the next 7 days";
    case 30:
      return "the next 30 days";
    case 365:
      return "the next 12 months";
    default:
      return "the selected time range";
  }
};

const UpcomingShows = ({ isHead, selectedDepartment }: UpcomingShowsProps) => {
  const { user } = useAuthContext();
  const [selectedDay, setSelectedDay] = useState("30");

  const { data, isLoading, isError } = useGetUpcomingShows({
    departmentId: !isHead && user?.department ? user.department.departmentId : selectedDepartment == "all" ? undefined : selectedDepartment,
    daysAhead: Number(selectedDay),
  });

  const daysOptions = [
    { name: "This Week", value: "7" },
    { name: "This Month", value: "30" },
    { name: "This Year", value: "365" },
  ];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <p>{!isHead && user?.department && user.department.name} Upcoming shows</p>
          </CardTitle>
          <CardDescription>Displays shows scheduled within {getRangeLabel(Number(selectedDay))}.</CardDescription>
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
            <p>{!isHead && user?.department && user.department.name} Upcoming shows</p>
            <Dropdown items={daysOptions} value={selectedDay} onChange={(value) => setSelectedDay(value)} />
          </div>
        </CardTitle>
        <CardDescription>Displays shows scheduled within {getRangeLabel(Number(selectedDay))}.</CardDescription>
      </CardHeader>
      <CardContent>
        {isError || !data ? (
          <div className="border flex items-center justify-center rounded-md p-5 text-sm text-foreground h-20">
            No Upcoming Shows within {getRangeLabel(Number(selectedDay))}.
          </div>
        ) : (
          <PaginatedTable
            emptyMessage={`No upcoming shows within ${getRangeLabel(Number(selectedDay))}.`}
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

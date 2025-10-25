import { useGetKPISummary } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type KPISummaryProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const KPISummary = ({ isHead, selectedDepartment }: KPISummaryProps) => {
  const { data, isLoading, isError } = useGetKPISummary({
    departmentId: isHead && selectedDepartment == "all" ? undefined : selectedDepartment,
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <KPILoader key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {!data || isError ? (
        <Card>
          <CardContent>No Data Available</CardContent>
        </Card>
      ) : (
        // <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isHead && selectedDepartment === "all" && "lg:grid-cols-5"} `}>
        //   <KPICard title="Total Shows" value={data.totalShows} />
        //   <KPICard title="Upcoming Shows (Next 30 days)" value={data.upcomingShows} />
        //   {isHead && selectedDepartment === "all" && <KPICard title="Total Departments" value={data.totalDepartments} />}

        //   <KPICard title="Open Schedules" value={data.openSchedules} />
        //   <KPICard title="Closed Schedules" value={data.closedSchedules} />

        // </div>
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${isHead && selectedDepartment === "all" ? "xl:grid-cols-6" : ""}`}>
          <KPICard title="Total Shows" value={data.totalShows ?? 0} />
          <KPICard title="Upcoming Shows" value={data.upcomingShows ?? 0} />
          {isHead && selectedDepartment === "all" && <KPICard title="Total Departments" value={data.totalDepartments ?? 0} />}
          <KPICard title="Open Schedules" value={data.openSchedules ?? 0} />
          <KPICard title="Closed Schedules" value={data.closedSchedules ?? 0} />
          <KPICard title="Active Group Members" value={data.totalDistributors ?? 0} />
        </div>
      )}
    </div>
  );
};

const KPILoader = () => {
  return <Skeleton className="w-60 h-60 rounded-xl bg-muted" />;
};

type KPICardProps = {
  title: string;
  value: string | number;
};
const KPICard = ({ title, value }: KPICardProps) => {
  return (
    <Card className="w-full pr-6 pt-2">
      <CardContent className="pl-4 pb-4">
        <p className="text-muted-foreground flex flex-wrap items-center gap-2">
          <p>{title}</p>
        </p>
        <p className="text-2xl font-bold mt-4">{value}</p>
      </CardContent>
    </Card>
  );
};

export default KPISummary;

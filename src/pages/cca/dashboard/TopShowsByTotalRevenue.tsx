import { useGetTopShowsByTotalRevenue } from "@/_lib/@react-client-query/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";

type TopShowsByTotalRevenueProps = {
  isHead: boolean;
  selectedDepartment: string;
};

const TopShowsByTotalRevenue = ({ isHead, selectedDepartment }: TopShowsByTotalRevenueProps) => {
  const { user } = useAuthContext();

  const {
    data: topShows,
    isLoading,
    isError,
  } = useGetTopShowsByTotalRevenue({
    departmentId: !isHead && user?.department ? user.department.departmentId : selectedDepartment == "all" ? undefined : selectedDepartment,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <p>{!isHead && user?.department && user.department.name} Top Shows by Total Revenue</p>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <p>{!isHead && user?.department && user.department.name} Top Shows by Total Revenue</p>
        </CardTitle>
        <CardDescription>Visual comparison of ticket sales per show.</CardDescription>
      </CardHeader>
      <CardContent>
        {isError || !topShows ? (
          <div className="border flex items-center justify-center rounded-md p-5 text-sm text-foreground h-20">No Data Available.</div>
        ) : (
          <div></div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopShowsByTotalRevenue;

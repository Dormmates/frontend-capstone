import { ContentWrapper } from "@/components/layout/Wrapper";
import { useAuthContext } from "@/context/AuthContext";
import TopShowsByTicketsSold from "./TopShowsByTicketsSold";
import TopShowsByTotalRevenue from "./TopShowsByTotalRevenue";
import TopShowsByGenre from "./TopShowsByGenre";
import TopDistributors from "./TopDistributors";
import { useMemo, useState } from "react";
import { useGetDepartments } from "@/_lib/@react-client-query/department";
import Dropdown from "@/components/Dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPISummary from "./KPISummary";
import UpcomingShows from "./UpcomingShows";

const CCADashboard = () => {
  const { user } = useAuthContext();

  const isHead = !!user?.roles?.includes("head");

  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { data: departments, isLoading: loadingDepartments, isError: errorDepartments } = useGetDepartments(null, { enabled: isHead });

  const departmentOptions = useMemo(() => {
    if (!departments) return [];
    const options = departments.map((d) => ({ name: d.name, value: d.departmentId }));
    return [{ name: "All Departments", value: "all" }, ...options];
  }, [departments]);

  if (loadingDepartments) {
    return <h1>Loading..</h1>;
  }

  return (
    <ContentWrapper>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        {isHead && !errorDepartments && (
          <Dropdown onChange={(value) => setSelectedDepartment(value)} value={selectedDepartment} items={departmentOptions} />
        )}

        {!isHead && <div className="font-bold">{user?.department?.name}</div>}
      </div>

      <div className="flex gap-5 flex-col">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <p className="text-sm text-muted-foreground">Overview of active shows, schedules, and department performance.</p>
          <KPISummary isHead={isHead} selectedDepartment={selectedDepartment} />
        </section>

        <UpcomingShows isHead={isHead} selectedDepartment={selectedDepartment} />

        <div className="grid gap-5 lg:grid-cols-2">
          <TopDistributors isHead={isHead} selectedDepartment={selectedDepartment} />

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <p>{!isHead && user?.department && user.department.name} Top Shows </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tickets">
                <TabsList>
                  <TabsTrigger value="tickets">By Sold Tickets</TabsTrigger>
                  <TabsTrigger value="revenue">By Total Revenue</TabsTrigger>
                </TabsList>
                <TabsContent value="tickets">
                  <TopShowsByTicketsSold isHead={isHead} selectedDepartment={selectedDepartment} />
                </TabsContent>
                <TabsContent value="revenue">
                  <TopShowsByTotalRevenue isHead={isHead} selectedDepartment={selectedDepartment} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <TopShowsByGenre isHead={isHead} selectedDepartment={selectedDepartment} />
      </div>
    </ContentWrapper>
  );
};

export default CCADashboard;

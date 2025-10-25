import { ContentWrapper } from "@/components/layout/Wrapper";
import { useAuthContext } from "@/context/AuthContext";
import TopShowsByTicketsSold from "./TopShowsByTicketsSold";
import TopShowsByTotalRevenue from "./TopShowsByTotalRevenue";
import TopShowsByGenre from "./TopShowsByGenre";
import TopDistributors from "./TopDistributors";
import { useEffect, useMemo, useState } from "react";
import { useGetDepartments } from "@/_lib/@react-client-query/department";
import Dropdown from "@/components/Dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPISummary from "./KPISummary";
import UpcomingShows from "./UpcomingShows";
import noData from "@/assets/images/no-data.png";

const CCADashboard = () => {
  const { user } = useAuthContext();

  const isHead = !!user?.roles?.includes("head");

  const [selectedDepartment, setSelectedDepartment] = useState(isHead ? "all" : (user?.departments[0]?.departmentId as string));
  const { data: departments, isLoading: loadingDepartments, isError: errorDepartments } = useGetDepartments(!isHead ? user?.userId : undefined);

  const departmentOptions = useMemo(() => {
    if (!departments) return [];
    const options = departments.map((d) => ({ name: d.name, value: d.departmentId }));

    return isHead ? [{ name: "All Departments", value: "all" }, ...options] : options;
  }, [departments, isHead]);

  useEffect(() => {
    document.title = `SLU CCA - Dashboard | ${user?.firstName} ${user?.lastName}`;
  }, []);

  if (loadingDepartments) {
    return <h1>Loading..</h1>;
  }

  if (!user?.roles.includes("head") && user?.departments.length === 0) {
    return (
      <ContentWrapper>
        <h1 className="text-3xl">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>

        <div className="flex flex-col mt-10 items-center">
          <div className="mb-6 text-2xl text-muted-foreground text-center max-w-[700px]">
            It looks like you don’t have a performing group assigned yet. If you think this is an error, please contact your CCA Head to get assigned.
          </div>

          <div className="flex justify-center">
            <img className="max-w-[450px] w-full" src={noData} alt="No performing group assigned" />
          </div>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="flex flex-col items-start gap-3 mb-5 md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl">
          Welcome, {user?.firstName} {user?.lastName}
        </h1>
        {!errorDepartments && <Dropdown onChange={(value) => setSelectedDepartment(value)} value={selectedDepartment} items={departmentOptions} />}
      </div>

      <div className="flex gap-5 flex-col">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            {selectedDepartment == "all" ? "All Performing Groups" : departmentOptions.find((d) => d.value === selectedDepartment)?.name} Performance
            Overview
          </h2>
          <p className="text-sm text-muted-foreground">Overview of active shows, schedules, and department performance.</p>
          <KPISummary isHead={isHead} selectedDepartment={selectedDepartment} />
        </section>

        <UpcomingShows isHead={isHead} selectedDepartment={selectedDepartment} />

        <div className="grid gap-5 lg:grid-cols-2">
          <TopDistributors isHead={isHead} selectedDepartment={selectedDepartment} />

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <p>Top Shows </p>
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

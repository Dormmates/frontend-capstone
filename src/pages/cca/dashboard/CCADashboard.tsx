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
      <h1 className="text-3xl">
        Welcome, {user?.firstName} {user?.lastName}
      </h1>
      {isHead && !errorDepartments && (
        <Dropdown onChange={(value) => setSelectedDepartment(value)} value={selectedDepartment} items={departmentOptions} />
      )}

      <Card>
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

      <TopDistributors isHead={isHead} selectedDepartment={selectedDepartment} />

      <TopShowsByGenre />
    </ContentWrapper>
  );
};

export default CCADashboard;

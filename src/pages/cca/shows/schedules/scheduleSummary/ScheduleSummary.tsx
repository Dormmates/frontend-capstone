import { useParams } from "react-router-dom";
import { useGetScheduleSummary } from "@/_lib/@react-client-query/schedule.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ScheduleSummary = () => {
  const { scheduleId } = useParams();
  const { data: summary, isLoading: loadingSummary, isError: summaryError } = useGetScheduleSummary(scheduleId as string);

  // const percentage = summary && summary.expectedSales > 0 ? (summary.currentSales / summary.expectedSales) * 100 : 0;

  // const data = {
  //   labels: ["Sold", "Unsold", "Not Allocated", "Pending Remittance"],
  //   datasets: [
  //     {
  //       label: "Tickets",
  //       data: [summary?.sold, summary?.unsold, summary?.notAllocated, summary?.pendingRemittance],
  //       backgroundColor: [
  //         "#4CAF50", // green for sold
  //         "#FF9800", // orange for unsold
  //         "#9E9E9E", // gray for not allocated
  //         "#F44336", // red for pending
  //       ],
  //       borderColor: ["#fff"],
  //       borderWidth: 2,
  //     },
  //   ],
  // };

  // const options = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: "right" as const,
  //       labels: {
  //         boxWidth: 20,
  //         padding: 15,
  //       },
  //     },
  //   },
  // };

  if (loadingSummary) {
    return <h1>Loading...</h1>;
  }

  if (!summary || summaryError) {
    return <h1>Error loading</h1>;
  }

  return (
    <>
      <h1 className="font-semibold">Schedule Summary</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distributors</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audience</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </>
  );
};

export default ScheduleSummary;

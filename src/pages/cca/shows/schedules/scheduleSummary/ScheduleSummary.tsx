import { useParams } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { useGetScheduleSummary } from "@/_lib/@react-client-query/schedule.ts";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils";

const ScheduleSummary = () => {
  const { scheduleId } = useParams();
  const { data: summary, isLoading: loadingSummary, isError: summaryError } = useGetScheduleSummary(scheduleId as string);

  const percentage = summary && summary.expectedSales > 0 ? (summary.currentSales / summary.expectedSales) * 100 : 0;

  const data = {
    labels: ["Sold", "Unsold", "Not Allocated", "Pending Remittance"],
    datasets: [
      {
        label: "Tickets",
        data: [summary?.sold, summary?.unsold, summary?.notAllocated, summary?.pendingRemittance],
        backgroundColor: [
          "#4CAF50", // green for sold
          "#FF9800", // orange for unsold
          "#9E9E9E", // gray for not allocated
          "#F44336", // red for pending
        ],
        borderColor: ["#fff"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
    },
  };

  if (loadingSummary) {
    return <h1>Loading...</h1>;
  }

  if (!summary || summaryError) {
    return <h1>Error loading</h1>;
  }

  return (
    <>
      <h1 className="font-semibold">Sale Summary</h1>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p>
            Sale Progress (<span className="font-medium"> {percentage}%</span>)
          </p>
          <Progress value={percentage} />
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <SimpleCard className="border-l-primary" label="Expected Total Sales" value={formatCurrency(summary.expectedSales)} />
            <SimpleCard label="Current Sales" value={formatCurrency(summary.currentSales)} />
            <SimpleCard className="border-l-red" label="Remaining" value={formatCurrency(summary.remainingSales)} />
          </div>
          <div className="flex items-end">
            <Button>Generate Sales Report</Button>
          </div>
        </div>
      </div>

      <hr className="text-lightGrey my-10" />

      <h1 className="font-semibold">Tickets Summary</h1>
      <div className="flex gap-5">
        <div className="flex flex-col border border-lightGrey rounded-md shadow-sm p-5 max-w-[450px]">
          <p className="font-sm font-semibold">Ticket Statuses</p>
          <div className="w-[400px] h-[300px]">
            <Pie data={data} options={options} />
          </div>
        </div>
        <div className="flex gap-2 h-fit flex-wrap">
          <SimpleCard className="border-l-primary" label="Total Tickets" value={summary.totalTicket} />
          <SimpleCard label="Orchestra Tickets" value={summary.totalOrchestra} />
          <SimpleCard className="border-l-purple-200" label="Balcony Tickets" value={summary.totalBalcony} />
          <SimpleCard className="border-l-blue-300" label="Complimentary Tickets" value={summary.totalComplimentary} />
        </div>
      </div>
    </>
  );
};

export default ScheduleSummary;

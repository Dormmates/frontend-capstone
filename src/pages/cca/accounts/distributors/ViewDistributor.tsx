import { useGetDistributorData } from "@/_lib/@react-client-query/accounts";
import { useGetAllDistributorAllocationHistory, useGetAllDistributorRemittanceHistory } from "@/_lib/@react-client-query/schedule";
import { useGetShowsAndDistributorTickets } from "@/_lib/@react-client-query/show";
import Breadcrumbs from "@/components/BreadCrumbs";
import { ContentWrapper } from "@/components/layout/Wrapper";
import PaginatedTable from "@/components/PaginatedTable";
import { Button } from "@/components/ui/button";
import type { DistributorScheduleTickets } from "@/types/ticket";
import { formatCurrency } from "@/utils";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DistributorAllocationHistory from "./DistributorAllocationHistory";
import DistributorRemittanceHistory from "./DistributorRemittanceHistory";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const calculateRemittanceAmount = (schedule: DistributorScheduleTickets) => {
  const soldTickets = schedule.tickets.filter((ticket) => ticket.status === "sold");
  const totalSales = soldTickets.reduce((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
  const commission = soldTickets.length * (Number(schedule.commissionFee) || 0);
  const amountToRemit = totalSales - commission;

  return { totalSales, commission, amountToRemit };
};

const ViewDistributor = () => {
  const { distributorId } = useParams();
  const { data: distributor, isLoading: loadingDistributor, isError: distributorError } = useGetDistributorData(distributorId as string);
  const { data, isLoading, isError } = useGetShowsAndDistributorTickets(distributorId as string);

  const [viewHistory, setViewHistory] = useState(false);

  if (isLoading || loadingDistributor) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError || distributorError || !distributor) {
    return <h1>Error</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl">Distributor Informations</h1>

      <div className="my-10">
        <Breadcrumbs
          backHref="/manage/distributors"
          items={[{ name: "Distributors", href: "/manage/distributors" }, { name: distributor.firstName + " " + distributor.lastName }]}
        />
      </div>

      <div className="mb-10">
        <h1 className="text-xl">{distributor.firstName + " " + distributor.lastName}</h1>
        <div></div>
      </div>

      <p className="text-darkGrey mb-3 font-medium">Shows and show schedules that distributor have current allocations</p>
      <PaginatedTable
        data={data}
        columns={[
          {
            key: "title",
            header: "Show Title",
            render: (schedule) => (
              <div className="flex items-center gap-2">
                <img className="w-5" src={schedule.show.showCover} alt="cover" />
                <p>{schedule.show.title}</p>
              </div>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (schedule) => formatToReadableDate(schedule.datetime + ""),
          },
          {
            key: "time",
            header: "Time",
            render: (schedule) => formatToReadableTime(schedule.datetime + ""),
          },
          {
            key: "tickets",
            header: "Tickets Allocated",
            render: (schedule) => schedule.tickets.length,
          },
          {
            key: "sold",
            header: "Sold Tickets",
            render: (schedule) => schedule.tickets.filter((ticket) => ticket.status === "sold" || ticket.isRemitted).length,
          },
          {
            key: "amount",
            header: "Amount to be Remitted",
            render: (schedule) => {
              const { amountToRemit } = calculateRemittanceAmount(schedule);
              return formatCurrency(amountToRemit);
            },
          },
          {
            key: "action",
            header: "Actions",
            render: (schedule) => (
              <Link to={`/shows/schedule/${schedule.show.showId}/${schedule.scheduleId}/d&r/${distributorId}`}>
                <Button variant="outline">Go To Detailed View</Button>
              </Link>
            ),
          },
        ]}
      />

      <div className="flex items-center gap-2 mt-10">
        <Checkbox id="viewHistory" checked={viewHistory} onCheckedChange={(checked) => setViewHistory(!!checked)} />
        <Label htmlFor="viewHistory">View Distributor Histories?</Label>
      </div>

      {viewHistory && <DistributorHistory />}
    </ContentWrapper>
  );
};

const DistributorHistory = () => {
  const { distributorId } = useParams();

  const {
    data: allocationHistory,
    isLoading: loadingAllocation,
    isError: errorAllocation,
  } = useGetAllDistributorAllocationHistory(distributorId as string);

  const {
    data: remittanceHistory,
    isLoading: loadingRemittance,
    isError: erroRemittance,
  } = useGetAllDistributorRemittanceHistory(distributorId as string);

  if (loadingAllocation || loadingRemittance) {
    return <h1>Loadingg</h1>;
  }

  if (!allocationHistory || !remittanceHistory || errorAllocation || erroRemittance) {
    return <h1>Error loading</h1>;
  }

  return (
    <div>
      <h1 className="text-xl mt-5">Distributor History</h1>

      <Tabs className="mt-5" defaultValue="Allocation History">
        <TabsList>
          <TabsTrigger value="Allocation History">Allocation History</TabsTrigger>
          <TabsTrigger value="Remittance History">Remittance History</TabsTrigger>
        </TabsList>
        <TabsContent value="Allocation History">
          <DistributorAllocationHistory allocationHistory={allocationHistory} />
        </TabsContent>
        <TabsContent value="Remittance History">
          <DistributorRemittanceHistory remittanceHistory={remittanceHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewDistributor;

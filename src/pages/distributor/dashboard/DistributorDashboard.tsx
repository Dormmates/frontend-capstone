import { useMemo, useState } from "react";
import { useGetShowsAndDistributorTickets } from "@/_lib/@react-client-query/show.ts";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date.ts";
import type { DistributorScheduleTickets } from "@/types/ticket.ts";
import ViewAllocatedTickets from "./ViewAllocatedTickets";
import { formatCurrency } from "@/utils";
import SimpleCard from "@/components/SimpleCard";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import PaginatedTable from "@/components/PaginatedTable";

const calculateRemittanceAmount = (schedule: DistributorScheduleTickets) => {
  const soldTickets = schedule.tickets.filter((ticket) => ticket.status === "sold");
  const totalSales = soldTickets.reduce((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
  const commission = soldTickets.length * (Number(schedule.commissionFee) || 0);
  const amountToRemit = totalSales - commission;

  return { totalSales, commission, amountToRemit };
};

const DistributorDashboard = () => {
  const { user } = useAuthContext();
  const { data, isLoading, isError } = useGetShowsAndDistributorTickets(user?.userId as string);

  const summary = useMemo(() => {
    if (!data) return { allocatedTickets: 0, soldTickets: 0, unsoldTickets: 0 };

    const allocatedTickets = data.reduce((acc, cur) => acc + cur.tickets.length, 0);
    const soldTickets = data.reduce((acc, cur) => acc + cur.tickets.filter((ticket) => ticket.status === "sold").length, 0);
    const unsoldTickets = allocatedTickets - soldTickets;

    return { allocatedTickets, soldTickets, unsoldTickets };
  }, [data]);

  const [selectedSchedule, setSelectedSchedule] = useState<DistributorScheduleTickets | null>(null);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error fetching</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="font-bold text-4xl">Welcome, {user?.firstName + " " + user?.lastName}</h1>

      <div className="flex flex-col mt-10">
        <p className="text-xl">Shows and show schedules that have tickets allocated to you</p>
        <div className="flex gap-3 my-8">
          <SimpleCard className="!border-l-blue-400" label="Current Allocated Tickets" value={summary.allocatedTickets} />
          <SimpleCard label="Sold Tickets" value={summary.soldTickets} />
          <SimpleCard className="!border-l-red" label="Unsold Tickets" value={summary.unsoldTickets} />
        </div>

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
                <Button onClick={() => setSelectedSchedule(schedule)} variant="outline">
                  View Tickets
                </Button>
              ),
            },
          ]}
        />
      </div>

      {selectedSchedule && (
        <Modal className="w-full max-w-[1000px]" isOpen={!!selectedSchedule} onClose={() => setSelectedSchedule(null)} title="Tickets Allocated">
          <ViewAllocatedTickets closeModal={() => setSelectedSchedule(null)} schedule={selectedSchedule} />
        </Modal>
      )}
    </ContentWrapper>
  );
};

export default DistributorDashboard;

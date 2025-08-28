import { useMemo, useState } from "react";
import { useGetShowsAndDistributorTickets } from "../../../_lib/@react-client-query/show";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import SimpleCard from "../../../components/ui/SimpleCard";
import { useAuthContext } from "../../../context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table";
import { formatToReadableDate, formatToReadableTime } from "../../../utils/date";
import type { DistributorScheduleTickets } from "../../../types/ticket";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ViewAllocatedTickets from "./ViewAllocatedTickets";
import { formatCurrency } from "../../../utils";

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
    <ContentWrapper className="lg:!p-20">
      <h1 className="font-bold text-4xl">Welcome, {user?.firstName + " " + user?.lastName}</h1>

      <div className="flex flex-col mt-10">
        <p className="text-xl">Shows and show schedules that have tickets allocated to you</p>
        <div className="flex gap-3 my-8">
          <SimpleCard className="!border-l-blue-400" label="Current Allocated Tickets" value={summary.allocatedTickets} />
          <SimpleCard label="Sold Tickets" value={summary.soldTickets} />
          <SimpleCard className="!border-l-red" label="Unsold Tickets" value={summary.unsoldTickets} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Show Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Tickets Allocated</TableHead>
              <TableHead>Sold Tickets</TableHead>
              <TableHead>Amount to be Remitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  No Allocated Tickets
                </TableCell>
              </TableRow>
            ) : (
              data.map((schedule) => {
                const { amountToRemit } = calculateRemittanceAmount(schedule);

                return (
                  <TableRow key={schedule.scheduleId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img className="w-5" src={schedule.show.showCover} alt="cover" />
                        <p>{schedule.show.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatToReadableDate(schedule.datetime + "")}</TableCell>
                    <TableCell>{formatToReadableTime(schedule.datetime + "")}</TableCell>
                    <TableCell>{schedule.tickets.length}</TableCell>
                    <TableCell>{schedule.tickets.filter((ticket) => ticket.status === "sold").length}</TableCell>
                    <TableCell>{formatCurrency(amountToRemit)}</TableCell>
                    <TableCell>
                      <Button onClick={() => setSelectedSchedule(schedule)} className="!bg-gray !text-black !border-lightGrey border-2">
                        View Tickets
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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

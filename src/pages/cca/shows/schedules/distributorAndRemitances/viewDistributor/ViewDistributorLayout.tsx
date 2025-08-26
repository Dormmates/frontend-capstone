import { useMemo, useState } from "react";
import { NavLink, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useGetAllocatedTicketsOfDistributor, useUnAllocateTicket } from "../../../../../../_lib/@react-client-query/schedule";
import BreadCrumb from "../../../../../../components/ui/BreadCrumb";
import Button from "../../../../../../components/ui/Button";

import allocated_icon from "../../../../../../assets/icons/allocated_tickets.png";
import unsold_icon from "../../../../../../assets/icons/unsold_ticket.png";
import sold_icon from "../../../../../../assets/icons/sold_ticket.png";
import verified_icon from "../../../../../../assets/icons/verified_remitted.png";
import pending_icon from "../../../../../../assets/icons/pending_remittance.png";
import expected_icon from "../../../../../../assets/icons/expected_sales.png";
import remitted_icon from "../../../../../../assets/icons/remitted.png";
import balance_due_icon from "../../../../../../assets/icons/balance_due.png";
import type { ShowData } from "../../../../../../types/show";
import type { Schedule } from "../../../../../../types/schedule";
import Modal from "../../../../../../components/ui/Modal";
import UnallocateTicket from "../unallocateTicket/UnallocateTicket";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../../../../context/AuthContext";
import ToastNotification from "../../../../../../utils/toastNotification";

const links = [
  {
    name: "Ticket Overview",
    path: "",
  },
  {
    name: "Allocation Logs",
    path: "/allocation/history",
  },
  {
    name: "Remittance Logs",
    path: "/remittance/history",
  },
];

const ViewDistributorLayout = () => {
  const queryClient = useQueryClient();
  const unAllocateTicket = useUnAllocateTicket();

  const { user } = useAuthContext();
  const { schedule, show } = useOutletContext<{ show: ShowData; schedule: Schedule }>();
  const { distributorId, showId, scheduleId } = useParams();
  const { data, isLoading, isError } = useGetAllocatedTicketsOfDistributor(distributorId as string, scheduleId as string);

  const [isUnallocateTicket, setIsUnallocateTicket] = useState(false);

  const summary = useMemo(() => {
    if (!data)
      return {
        totalAllocatedTickets: 0,
        soldTickets: 0,
        unsoldTickets: 0,
        remittedTickets: 0,
        pendingRemittance: 0,
        expected: 0,
        remmited: 0,
        balanceDue: 0,
      };

    const totalAllocatedTickets = data.length;
    const soldTickets = data.filter((ticket) => ticket.status == "sold").length;
    const unsoldTickets = totalAllocatedTickets - soldTickets;
    const remittedTickets = data.filter((ticket) => ticket.isRemitted).length;

    const pendingRemittance = soldTickets - remittedTickets;
    const expected = data.reduce<number>((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
    const remitted = data.filter((ticket) => ticket.isRemitted).reduce<number>((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
    const balanceDue = expected - remitted;

    return { totalAllocatedTickets, soldTickets, unsoldTickets, remittedTickets, pendingRemittance, expected, remitted, balanceDue };
  }, [data]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  const distributorName = data[0].distributor;

  return (
    <div className="flex flex-col gap-5 mt-5">
      <BreadCrumb
        backLink={`/shows/schedule/${showId}/${scheduleId}/d&r/`}
        items={[
          { name: "Distributor", path: `/shows/schedule/${showId}/${scheduleId}/d&r/` },
          { name: distributorName, path: "" },
        ]}
      />
      <div className="flex flex-col gap-5 mt-5">
        <h1 className="text-2xl">{distributorName}</h1>
        <div className="flex gap-3 items-center">
          <Button className="!bg-green">Allocate Ticket</Button>
          <Button onClick={() => setIsUnallocateTicket(true)} className="!bg-red">
            Unallocate Ticket
          </Button>
          <Button className="!bg-primary">Remit Tickets</Button>
          <Button className="!bg-rose-500">Unremit Tickets</Button>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src={allocated_icon} alt="allocted" />
              <p>Allocated Tickets: {summary.totalAllocatedTickets} tickets</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={unsold_icon} alt="unsold" />
              <p>Unsold Tickets: {summary.unsoldTickets} tickets</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={sold_icon} alt="sold" />
              <p>Sold Tickets: {summary.soldTickets} tickets</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={verified_icon} alt="verified" />
              <p>Verified Remittance: {summary.remittedTickets} tickets</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={pending_icon} alt="pending" />
              <p>Pending Remittance: {summary.pendingRemittance} tickets</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src={expected_icon} alt="expected" />
              <p>Expected: PHP {summary.expected}</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={remitted_icon} alt="remitted" />
              <p>Remitted: PHP {summary.remitted} </p>
            </div>
            <div className="flex items-center gap-2">
              <img src={balance_due_icon} alt="balance due" />
              <p>Balance Due: PHP {summary.balanceDue} </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="w-full border-lightGrey mt-5" />
      <div className="my-5 flex gap-5">
        {links.map((link, index) => (
          <NavLink
            key={index}
            end={link.path == ""}
            className={({ isActive }) => (isActive ? "font-semibold" : "font-normal text-lightGrey")}
            to={`/shows/schedule/${showId}/${scheduleId}/d&r/${distributorId}${link.path}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      <div>
        <Outlet context={{ allocatedTickets: data, schedule, show }} />
      </div>

      {isUnallocateTicket && (
        <Modal isOpen={isUnallocateTicket} onClose={() => setIsUnallocateTicket(false)} title="Ticket Unallocation">
          <UnallocateTicket
            controlNumbersAllocated={data
              .filter((ticket) => !ticket.isRemitted && ticket.status == "allocated")
              .map((ticket) => ticket.controlNumber)}
            close={() => setIsUnallocateTicket(false)}
            disabled={unAllocateTicket.isPending}
            onSubmit={(controlNumbers) => {
              const payload = {
                distributorId: distributorId as string,
                scheduleId: scheduleId as string,
                unallocatedBy: user?.userId as string,
                controlNumbers,
              };

              unAllocateTicket.mutate(payload, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["schedule", "allocated", scheduleId, distributorId], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["schedule", "seatmap", scheduleId], exact: true });
                  queryClient.invalidateQueries({ queryKey: ["schedule", "tickets", scheduleId] });
                  setIsUnallocateTicket(false);
                  ToastNotification.success("Ticket Unallocated");
                },
                onError: (err) => {
                  ToastNotification.error(err.message);
                },
              });
            }}
            schedule={schedule}
            show={show}
            distributorName={distributorName}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewDistributorLayout;

import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useGetAllocatedTicketsOfDistributor, useUnAllocateTicket } from "../../../../../../_lib/@react-client-query/schedule";

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

import UnallocateTicket from "../unallocateTicket/UnallocateTicket";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../../../../context/AuthContext";
import ToastNotification from "../../../../../../utils/toastNotification";
import RemitTickets from "../remitTicket/RemitTickets";
import { formatCurrency } from "../../../../../../utils";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/BreadCrumbs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const { schedule, show } = useOutletContext<{ show: ShowData; schedule: Schedule }>();
  const { distributorId, showId, scheduleId } = useParams();
  const { data, isLoading, isError } = useGetAllocatedTicketsOfDistributor(distributorId as string, scheduleId as string);

  const [isUnallocateTicket, setIsUnallocateTicket] = useState(false);
  const [isRemitTicket, setIsRemitTicket] = useState(false);

  const summary = useMemo(() => {
    if (!data)
      return {
        totalAllocatedTickets: 0,
        soldTickets: 0,
        unsoldTickets: 0,
        remittedTickets: 0,
        pendingRemittance: 0,
        expected: 0,
        remitted: 0,
        balanceDue: 0,
      };

    const totalAllocatedTickets = data.length;
    const soldTickets = data.filter((ticket) => ticket.status == "sold" || ticket.isRemitted).length;
    const unsoldTickets = totalAllocatedTickets - soldTickets;
    const remittedTickets = data.filter((ticket) => ticket.isRemitted).length;

    const pendingRemittance = soldTickets - remittedTickets;
    const expected = data.reduce<number>((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
    const remitted = data.filter((ticket) => ticket.isRemitted).reduce<number>((acc, ticket) => acc + Number(ticket.ticketPrice), 0);
    const balanceDue = expected - remitted;

    return { totalAllocatedTickets, soldTickets, unsoldTickets, remittedTickets, pendingRemittance, expected, remitted, balanceDue };
  }, [data]);

  console.log(data);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data || isError) {
    return <h1>Error</h1>;
  }

  if (!data[0]) {
    navigate(`/shows/schedule/${showId}/${scheduleId}/d&r/`);
  }

  const distributorName = data[0]?.distributor;

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Breadcrumbs
        backHref={`/shows/schedule/${showId}/${scheduleId}/d&r/`}
        items={[{ name: "Distributor List", href: `/shows/schedule/${showId}/${scheduleId}/d&r/` }, { name: distributorName }]}
      />
      <div className="flex flex-col gap-5 ">
        <h1 className="text-2xl">{distributorName}</h1>
        <div className="flex gap-3 items-center">
          <Button className="!bg-green">Allocate Ticket</Button>
          <Button onClick={() => setIsUnallocateTicket(true)} className="!bg-red">
            Unallocate Ticket
          </Button>
          <Button onClick={() => setIsRemitTicket(true)} className="!bg-primary">
            Remit Tickets
          </Button>
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
              <p>Expected: {formatCurrency(summary.expected)}</p>
            </div>
            <div className="flex items-center gap-2">
              <img src={remitted_icon} alt="remitted" />
              <p>Remitted: {formatCurrency(summary.remitted)} </p>
            </div>
            <div className="flex items-center gap-2">
              <img src={balance_due_icon} alt="balance due" />
              <p>Balance Due: {formatCurrency(summary.balanceDue)} </p>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div className="mb-5 flex gap-5">
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
        <Dialog open={isUnallocateTicket} onOpenChange={() => setIsUnallocateTicket(false)}>
          <DialogContent className="max-w-xl max-h-[85vh] p-0 ">
            <ScrollArea className="max-h-[85vh] p-6">
              <DialogHeader className="mb-10">
                <DialogTitle>Unallocate Ticket</DialogTitle>
                <DialogDescription>Distributor: {distributorName}</DialogDescription>
              </DialogHeader>

              <UnallocateTicket
                controlNumbersAllocated={data
                  .filter((ticket) => !ticket.isRemitted && ticket.status === "allocated")
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
                    onError: (err: any) => {
                      ToastNotification.error(err.message);
                    },
                  });
                }}
                schedule={schedule}
                show={show}
                distributorName={distributorName}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {isRemitTicket && (
        <Dialog open={isRemitTicket} onOpenChange={() => setIsRemitTicket(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Remit Ticket Sales</DialogTitle>
            </DialogHeader>
            <RemitTickets closeRemit={() => setIsRemitTicket(false)} distributorData={data} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ViewDistributorLayout;

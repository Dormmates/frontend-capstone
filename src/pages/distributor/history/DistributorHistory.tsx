import { Outlet } from "react-router-dom";
import { useGetAllDistributorAllocationHistory, useGetAllDistributorRemittanceHistory } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useMemo } from "react";
import { formatCurrency } from "@/utils";
import SimpleCard from "@/components/SimpleCard";

const DistributorHistory = () => {
  const { user } = useAuthContext();
  const {
    data: allocationHistory,
    isLoading: loadingAllocation,
    isError: errorAllocation,
  } = useGetAllDistributorAllocationHistory(user?.userId as string);

  const {
    data: remittanceHistory,
    isLoading: loadingRemittance,
    isError: erroRemittance,
  } = useGetAllDistributorRemittanceHistory(user?.userId as string);

  const totalComputed = useMemo(() => {
    if (!remittanceHistory) {
      return {
        allocation: 0,
        remittance: 0,
        commission: 0,
        remittanceAmount: 0,
      };
    }

    const currentTickets = new Map();

    const sortedLogs = [...remittanceHistory].sort((a, b) => new Date(a.dateRemitted).getTime() - new Date(b.dateRemitted).getTime());

    for (const log of sortedLogs) {
      for (const t of log.tickets) {
        if (log.actionType === "payToCCA") {
          currentTickets.set(t.controlNumber, {
            ...t,
            totalCommission: log.totalCommission / log.tickets.length,
            totalRemittance: log.totalRemittance / log.tickets.length,
          });
        } else if (log.actionType === "unPayToCCA") {
          currentTickets.delete(t.controlNumber);
        }
      }
    }

    const ticketsArray = Array.from(currentTickets.values());
    const totalCommission = ticketsArray.reduce((sum, t) => sum + (t.totalCommission ?? 0), 0);
    const totalRemittance = ticketsArray.reduce((sum, t) => sum + (t.totalRemittance ?? 0), 0);

    return {
      allocation: allocationHistory?.reduce((acc, cur) => acc + cur.tickets.length, 0) ?? 0,
      remittance: ticketsArray.length,
      commission: totalCommission,
      remittanceAmount: totalRemittance,
    };
  }, [allocationHistory, remittanceHistory]);

  if (loadingAllocation || loadingRemittance) {
    return <h1>Loadingg</h1>;
  }

  if (!allocationHistory || !remittanceHistory || errorAllocation || erroRemittance) {
    return <h1>Error loading</h1>;
  }

  return (
    <ContentWrapper>
      <h1 className="font-bold text-4xl">Distributor History</h1>
      <div className="flex gap-3 mt-10">
        <SimpleCard label="Total Tickets Allocated" value={totalComputed.allocation} />
        <SimpleCard label="Total Tickets Sold" value={totalComputed.remittance} />
        <SimpleCard label="Total Sales" value={formatCurrency(totalComputed.remittanceAmount)} />
        <SimpleCard label="Total Commission Received" value={formatCurrency(totalComputed.commission)} />
      </div>

      <div>
        <Outlet context={{ allocationHistory, remittanceHistory }} />
      </div>
    </ContentWrapper>
  );
};

export default DistributorHistory;

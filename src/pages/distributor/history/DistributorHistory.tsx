import { Outlet } from "react-router-dom";
import { useGetAllDistributorAllocationHistory, useGetAllDistributorRemittanceHistory } from "@/_lib/@react-client-query/schedule.ts";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { ContentWrapper } from "@/components/layout/Wrapper.tsx";
import { useMemo } from "react";
import { formatCurrency } from "@/utils";
import SimpleCard from "@/components/SimpleCard";
import Loading from "@/components/Loading";
import Error from "@/components/Error";

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

    const paidLogs = remittanceHistory.filter((log) => log.actionType === "payToCCA");
    const totalCommission = paidLogs.reduce((sum, log) => sum + (log.totalCommission ?? 0), 0);
    const totalRemittance = paidLogs.reduce((sum, log) => sum + (log.totalRemittance ?? 0), 0);
    const remittance = paidLogs.reduce((count, log) => count + (log.tickets?.length ?? 0), 0);

    return {
      allocation: allocationHistory?.reduce((acc, cur) => acc + (cur.tickets?.length ?? 0), 0) ?? 0,
      remittance,
      commission: totalCommission,
      remittanceAmount: totalRemittance,
    };
  }, [allocationHistory, remittanceHistory]);

  if (loadingAllocation || loadingRemittance) {
    return <Loading />;
  }

  if (!allocationHistory || !remittanceHistory || errorAllocation || erroRemittance) {
    return <Error />;
  }

  return (
    <ContentWrapper>
      <h1 className="font-bold text-4xl">Distributor History</h1>
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4 mt-10">
        <SimpleCard label="Total Tickets Allocated" value={totalComputed.allocation} />
        <SimpleCard label="Total Tickets Sold" value={totalComputed.remittance} />
        <SimpleCard label="Total Sales" value={formatCurrency(totalComputed.remittanceAmount)} />
        <SimpleCard label="Total Commission" value={formatCurrency(totalComputed.commission)} />
      </div>

      <div>
        <Outlet context={{ allocationHistory, remittanceHistory }} />
      </div>
    </ContentWrapper>
  );
};

export default DistributorHistory;

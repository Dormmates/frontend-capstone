import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useGetAllDistributorAllocationHistory, useGetAllDistributorRemittanceHistory } from "../../../_lib/@react-client-query/schedule";
import { useAuthContext } from "../../../context/AuthContext";
import { ContentWrapper } from "../../../components/layout/Wrapper";
import SimpleCard from "../../../components/ui/SimpleCard";
import { useMemo } from "react";
import { formatCurrency } from "../../../utils";

const links = [
  { path: "", name: "Allocation History" },
  { path: "/remittance", name: "Remittance History" },
];

const DistributorHistory = () => {
  const { user } = useAuthContext();
  const location = useLocation();
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

  const isOnAllocation = location.pathname.endsWith("/history");

  const totalTickets = useMemo(() => {
    if (!allocationHistory || !remittanceHistory) return { allocation: 0, remittance: 0 };

    const allocation = allocationHistory.map((log) => log.tickets.length).reduce((acc, cur) => (acc += cur), 0);
    const remittance = remittanceHistory.map((log) => log.tickets.length).reduce((acc, cur) => (acc += cur), 0);

    return { allocation, remittance };
  }, [allocationHistory, remittanceHistory]);

  const totalReceived = useMemo(() => {
    if (!remittanceHistory) return { commission: 0, remittance: 0 };

    const commission = remittanceHistory.filter((log) => log.actionType == "remit").reduce((acc, cur) => (acc += cur.totalCommission), 0);
    const remittance = remittanceHistory.filter((log) => log.actionType == "remit").reduce((acc, cur) => (acc += cur.totalRemittance), 0);

    return { commission, remittance };
  }, [remittanceHistory]);

  if (loadingAllocation || loadingRemittance) {
    return <h1>Loadingg</h1>;
  }

  if (!allocationHistory || !remittanceHistory || errorAllocation || erroRemittance) {
    return <h1>Error loading</h1>;
  }

  console.log(remittanceHistory);

  return (
    <ContentWrapper className="lg:!p-20">
      <h1 className="font-bold text-4xl">Distributor History</h1>

      <div className="flex gap-3 mt-10">
        <SimpleCard
          label={isOnAllocation ? "Total Tickets Allocated" : "Total Tickets Remitted"}
          value={isOnAllocation ? totalTickets.allocation : totalTickets.remittance}
        />

        <SimpleCard className="border-l-blue-400" label="Total Remittance" value={formatCurrency(totalReceived.remittance)} />
        <SimpleCard className="border-l-pink-400" label="Total Commision Received" value={formatCurrency(totalReceived.commission)} />
      </div>

      <div className="my-10 flex gap-5">
        {links.map((link, index) => (
          <NavLink
            key={index}
            end={link.path == ""}
            className={({ isActive }) => (isActive ? "font-semibold" : "font-normal text-lightGrey")}
            to={`/history${link.path}`}
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      <div>
        <Outlet context={{ allocationHistory, remittanceHistory }} />
      </div>
    </ContentWrapper>
  );
};

export default DistributorHistory;

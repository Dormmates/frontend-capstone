import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import CCALayout from "../pages/cca/CCALayout";
import DistributorLayout from "../pages/distributor/DistributorLayout";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

import DistributorDashboard from "../pages/distributor/dashboard/DistributorDashboard";
import DistributorHistory from "../pages/distributor/history/DistributorHistory";
import DistributorHistoryMenu from "@/pages/distributor/history/DistributorHistoryMenu";
import DistributorShowHistory from "@/pages/distributor/history/DistributorShowHistory";

import {
  CCAHeads,
  Distributors,
  Trainers,
  CreateShow,
  AddSchedule,
  ViewShow,
  PerformingGroups,
  CCADashboard,
  CCALogin,
  ViewShowScheduleLayout,
  ScheduleSummary,
  ScheduleDistributorAndRemittances,
  ScheduleReservations,
  ScheduleSeats,
  ScheduleTallyData,
  ScheduleTickets,
  TicketAllocation,
  ViewDistributorLayout,
  DistributorTicketsAllocated,
  DistributorAllocationHistory,
  DistributorRemittanceHistory,
  MajorProductionShows,
  PerformingGroupShows,
  ViewDistributor,
  Settings,
  ViewPerformingGroups,
} from "../pages/cca/index";

import CustomerShows from "@/pages/customer/CustomerShows";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import CustomerViewShow from "@/pages/customer/CustomerViewShow";
import CustomerViewSchedule from "@/pages/customer/CustomerViewSchedule";

import SalesReport from "@/pages/cca/shows/SalesReport";
import TicketSeatLocation from "@/components/TicketSeatLocation";
import LandingPage from "@/pages/customer/LandingPage";

const AppRoute = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      {/* ===================== ROOT ROUTE ===================== */}
      <Route
        path="/"
        element={
          !user ? (
            // No user, show Customer site
            <CustomerLayout />
          ) : user.roles.includes("distributor") ? (
            // Distributor , show distributor layout
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorLayout />
            </ProtectedRoute>
          ) : (
            // CCA Head or Trainer
            <ProtectedRoute allowedRoles={["head", "trainer"]}>
              <CCALayout />
            </ProtectedRoute>
          )
        }
      >
        {/* ===================== WHEN NO USER (CUSTOMER SITE) ===================== */}
        {!user && (
          <>
            <Route index element={<LandingPage />} />
            <Route path="/shows" element={<CustomerShows />} />
            <Route path="show/:showId" element={<CustomerViewShow />}>
              <Route path="schedule/:scheduleId" element={<CustomerViewSchedule />} />
            </Route>
          </>
        )}

        {/* ===================== WHEN DISTRIBUTOR ===================== */}
        {user?.roles.includes("distributor") && (
          <>
            <Route index element={<DistributorDashboard />} />
            <Route path="history" element={<DistributorHistory />}>
              <Route index element={<DistributorHistoryMenu />} />
              <Route path=":showId" element={<DistributorShowHistory />} />
            </Route>
          </>
        )}

        {/* ===================== WHEN HEAD / TRAINER ===================== */}
        {(user?.roles.includes("head") || user?.roles.includes("trainer")) && (
          <>
            <Route index element={<CCADashboard />} />

            {(user.roles.includes("head") || user.department) && (
              <>
                <Route path="shows" element={<PerformingGroupShows />} />
                <Route path="majorShows" element={<MajorProductionShows />} />
                <Route path="shows/add" element={<CreateShow />} />
                <Route path="shows/add/schedule/:id" element={<AddSchedule />} />
                <Route path="shows/schedule/:showId/:scheduleId" element={<ViewShowScheduleLayout />}>
                  <Route index element={<ScheduleSummary />} />
                  <Route path="d&r" element={<ScheduleDistributorAndRemittances />} />
                  <Route path="seats" element={<ScheduleSeats />} />
                  <Route path="tickets" element={<ScheduleTickets />} />
                  <Route path="tally" element={<ScheduleTallyData />} />
                  <Route path="reservations" element={<ScheduleReservations />} />
                  <Route path="d&r/:distributorId" element={<ViewDistributorLayout />}>
                    <Route index element={<DistributorTicketsAllocated />} />
                    <Route path="allocation/history" element={<DistributorAllocationHistory />} />
                    <Route path="remittance/history" element={<DistributorRemittanceHistory />} />
                  </Route>
                </Route>
                <Route path="shows/:id" element={<ViewShow />} />
                <Route path="manage/distributors/:distributorId" element={<ViewDistributor />} />
                <Route path="manage/distributors" element={<Distributors />} />
                <Route path="shows/:showId/:scheduleId/allocation" element={<TicketAllocation />} />
                <Route path="performing-groups" element={<PerformingGroups />} />
                <Route path="performing-groups/:groupId" element={<ViewPerformingGroups />} />
              </>
            )}

            {user.roles.includes("head") && (
              <>
                <Route path="manage/trainers" element={<Trainers />} />
                <Route path="manage/cca-head" element={<CCAHeads />} />
                <Route path="settings" element={<Settings />} />
              </>
            )}
          </>
        )}
      </Route>

      {/* ===================== LOGIN PAGE ===================== */}
      <Route path="/cca/login" element={user ? <Navigate to="/" replace /> : <CCALogin />} />

      {/* ===================== OTHERS ===================== */}
      <Route path="/unathorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
      <Route path="salesreport/:showId/:scheduleIds" element={<SalesReport />} />
      <Route path="seatLocation/:controlNumberParam/:scheduleIdParam" element={<TicketSeatLocation />} />
    </Routes>
  );
};

export default AppRoute;

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import CCALayout from "../pages/cca/CCALayout";
import DistributorLayout from "../pages/distributor/DistributorLayout";

import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

import DistributorDashboard from "../pages/distributor/dashboard/DistributorDashboard";
import DistributorHistory from "../pages/distributor/history/DistributorHistory";
import DistributorLogin from "../pages/distributor/DistributorLogin";

import {
  AccountRequests,
  CCAHead,
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
} from "../pages/cca/index";
import DistributorCompleteAllocationHistory from "../pages/distributor/history/DistributorCompleteAllocationHistory";
import DistributorCompleteRemittanceHistory from "../pages/distributor/history/DistributorCompleteRemittanceHistory";
import CustomerHome from "@/pages/customer/CustomerHome";
import CustomerLayout from "@/pages/customer/CustomerLayout";
import CustomerViewShow from "@/pages/customer/CustomerViewShow";
import CustomerViewSchedule from "@/pages/customer/CustomerViewSchedule";

const AppRoute = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      {/* Dynamic root route depending on user role */}
      <Route
        path="/"
        element={
          !user ? (
            <CCALogin />
          ) : user.roles.includes("distributor") ? (
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorLayout />
            </ProtectedRoute>
          ) : (
            <ProtectedRoute allowedRoles={["head", "trainer"]}>
              <CCALayout />
            </ProtectedRoute>
          )
        }
      >
        {user?.roles.includes("distributor") ? (
          <>
            <Route index element={<DistributorDashboard />} />
            <Route path="history" element={<DistributorHistory />}>
              <Route index element={<DistributorCompleteAllocationHistory />} />
              <Route path="remittance" element={<DistributorCompleteRemittanceHistory />} />
            </Route>
          </>
        ) : (
          <>
            <Route index element={<CCADashboard />} />
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
            <Route path="manage/distributors" element={<Distributors />} />
            <Route path="manage/distributor/:distributorId" element={<ViewDistributor />} />
            {/* <Route path="manage/request" element={<AccountRequests />} /> */}

            <Route path="shows/:showId/:scheduleId/allocation" element={<TicketAllocation />} />

            {user?.roles.includes("head") && (
              <>
                <Route path="performing-groups" element={<PerformingGroups />} />
                <Route path="manage/trainers" element={<Trainers />} />
                <Route path="manage/cca-head" element={<CCAHead />} />
              </>
            )}
          </>
        )}
      </Route>

      {/* Separate login route for distributor */}
      <Route
        path="/distributor/login"
        element={user ? user.roles.includes("distributor") ? <Navigate to="/" /> : <Navigate to="/" /> : <DistributorLogin />}
      />

      {/* Customer Routes */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="show/:showId" element={<CustomerViewShow />}>
          <Route path="schedule/:scheduleId" element={<CustomerViewSchedule />} />
        </Route>
      </Route>

      {/* Others */}
      <Route path="/unathorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoute;

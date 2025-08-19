import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

import CCALayout from "../layouts/CCALayout";
import DistributorLayout from "../layouts/DistributorLayout";

import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

import DistributorDashboard from "../pages/distributor/DistributorDashboard";
import DistributorHistory from "../pages/distributor/DistributorHistory";
import DistributorLogin from "../pages/distributor/DistributorLogin";

import {
  AccountRequests,
  CCAHead,
  Distributors,
  Trainers,
  CreateShow,
  AddSchedule,
  Shows,
  ViewShow,
  PerformingGroups,
  SeatMap,
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
} from "../pages/cca/index";

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
          ) : user.role === "distributor" ? (
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
        {user?.role === "distributor" ? (
          <>
            <Route index element={<DistributorDashboard />} />
            <Route path="history" element={<DistributorHistory />} />
          </>
        ) : (
          <>
            <Route index element={<CCADashboard />} />
            <Route path="shows" element={<Shows />} />
            <Route path="shows/add" element={<CreateShow />} />
            <Route path="shows/add/schedule/:id" element={<AddSchedule />} />
            <Route path="shows/schedule/:showId/:scheduleId" element={<ViewShowScheduleLayout />}>
              <Route index element={<ScheduleSummary />} />
              <Route path="d&r" element={<ScheduleDistributorAndRemittances />} />

              <Route path="seats" element={<ScheduleSeats />} />
              <Route path="tickets" element={<ScheduleTickets />} />
              <Route path="tally" element={<ScheduleTallyData />} />
              <Route path="reservations" element={<ScheduleReservations />} />
            </Route>
            <Route path="shows/:id" element={<ViewShow />} />
            <Route path="manage/distributors" element={<Distributors />} />
            <Route path="manage/request" element={<AccountRequests />} />

            <Route path="shows/:showId/:scheduleId/allocation" element={<TicketAllocation />} />

            {user?.role === "head" && (
              <>
                <Route path="performing-groups" element={<PerformingGroups />} />
                <Route path="manage/trainers" element={<Trainers />} />
                <Route path="manage/cca-head" element={<CCAHead />} />
                <Route path="seat" element={<SeatMap />} />
              </>
            )}
          </>
        )}
      </Route>

      {/* Separate login route for distributor */}
      <Route
        path="/distributor/login"
        element={user ? user.role === "distributor" ? <Navigate to="/" /> : <Navigate to="/" /> : <DistributorLogin />}
      />

      {/* Others */}
      <Route path="/unathorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoute;

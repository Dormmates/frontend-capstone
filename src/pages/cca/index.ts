import AccountRequests from "./accounts/AccountRequests";
import CCAHead from "./accounts/CCAHead";
import Distributors from "./accounts/distributors/Distributors";
import ViewDistributor from "./accounts/distributors/ViewDistributor";
import Trainers from "./accounts/trainer/Trainers";

import CreateShow from "./shows/CreateShow";
import AddSchedule from "./shows/addSchedule/AddSchedule";

import MajorProductionShows from "./shows/MajorProductionShows";
import PerformingGroupShows from "./shows/PerformingGroupShows";
import ViewShow from "./shows/ViewShow";

import ViewShowScheduleLayout from "./shows/schedules/ViewShowScheduleLayout";
import ScheduleDistributorAndRemittances from "./shows/schedules/distributorAndRemitances/ScheduleDistributorAndRemittances";
import TicketAllocation from "./shows/schedules/distributorAndRemitances/viewDistributor/distributorActions/allocateTicket/TicketAllocation";

import ViewDistributorLayout from "./shows/schedules/distributorAndRemitances/viewDistributor/ViewDistributorLayout";
import DistributorRemittanceHistory from "./shows/schedules/distributorAndRemitances/viewDistributor/remittanceHistory/DistributorRemittanceHistory";
import DistributorAllocationHistory from "./shows/schedules/distributorAndRemitances/viewDistributor/allocationHistory/DistributorAllocationHistory";
import DistributorTicketsAllocated from "./shows/schedules/distributorAndRemitances/viewDistributor/allocatedTickets/DistributorTicketsAllocated";

import ScheduleReservations from "./shows/schedules/scheduleReservations/ScheduleReservations";
import ScheduleSeats from "./shows/schedules/scheduleSeats/ScheduleSeats";
import ScheduleTallyData from "./shows/schedules/scheduleTallyData/ScheduleTallyData";
import ScheduleTickets from "./shows/schedules/scheduleTickets/ScheduleTickets";
import ScheduleSummary from "./shows/schedules/scheduleSummary/ScheduleSummary";

import PerformingGroups from "./groups/PerformingGroups";
import CCADashboard from "./dashboard/CCADashboard";

import CCALogin from "./CCALogin";

export {
  ViewDistributor,
  CCALogin,
  AccountRequests,
  CCAHead,
  Distributors,
  MajorProductionShows,
  PerformingGroupShows,
  Trainers,
  CreateShow,
  AddSchedule,
  ViewShow,
  PerformingGroups,
  CCADashboard,
  ViewShowScheduleLayout,
  ScheduleSummary,
  ScheduleDistributorAndRemittances,
  TicketAllocation,
  ScheduleReservations,
  ScheduleSeats,
  ScheduleTallyData,
  ScheduleTickets,
  ViewDistributorLayout,
  DistributorAllocationHistory,
  DistributorRemittanceHistory,
  DistributorTicketsAllocated,
};

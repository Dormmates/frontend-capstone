import type { Department } from "./department";
import type { Schedule, ScheduleWithTickets } from "./schedule";

export type ShowType = "majorConcert" | "showCase" | "majorProduction" | "";

export interface NewShowPayload {
  showTitle: string;
  description: string;
  department: string | null;
  genre: string;
  createdBy: string;
  showType: ShowType;
  image: File;
}

export interface UpdateShowPayload extends Omit<NewShowPayload, "createdBy"> {
  showId: string;
  oldFileId?: string;
}

export interface ShowData {
  showId: string;
  title: string;
  description: string;
  showType: ShowType;
  department?: Department;
  createdBy: string;
  createdAt: string;
  isArchived: boolean;
  showCover: string;
  genreNames: string[];
  showschedules: Schedule[];
}

export interface ShowDataWithSchedules extends ShowData {
  nextSchedule: Schedule | null;
  remainingUpcomingSchedules: Schedule[];
  pastSchedules: Schedule[];
}

export interface ShowDataWithSchedulesAndTickets extends ShowData {
  schedules: ScheduleWithTickets[];
}

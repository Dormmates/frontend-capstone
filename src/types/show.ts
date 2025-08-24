import type { Department } from "./department";
import type { Schedule } from "./schedule";

export type ShowType = "majorConcert" | "showCase" | "majorProduction" | "";

export interface NewShowPayload {
  showTitle: string;
  description: string;
  department: any;
  genre: string;
  createdBy: string;
  showType: any;
  image: File;
}

export interface UpdateShowPayload extends NewShowPayload {
  oldFileId?: string;
  showId: string;
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

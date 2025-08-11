import type { Department } from "./department";

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
  department: Department;
  createdBy: string;
  createdAt: string;
  isArchived: boolean;
  showCover: string;
  genreNames: string[];
  showschedules: any[];
}

export interface ShowList {
  shows: ShowData[];
}

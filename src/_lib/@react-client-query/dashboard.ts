import { useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { DistributorTypes } from "@/types/user";
import type { ShowType } from "@/types/show";

interface TopDistributors {
  department: string;
  distributorType: DistributorTypes;
  fullName: string;
  totalCommission: number;
  totalNetRevenue: number;
  totalTickets: number;
  userId: string;
  shows: {
    departmentName: string | null;
    schedules: {
      commission: number;
      dateTime: string;
      net: number;
      scheduleId: string;
      ticketsSold: number;
    }[];
    showId: string;
    showType: string;
    title: string;
  }[];
}

interface TopShowByTicketsSold {
  department: string;
  departmentId: string;
  showId: string;
  showTitle: string;
  showType: ShowType;
  soldTickets: 689;
}

interface TopShowByTotalRevenue {
  department: string;
  showId: string;
  showTitle: string;
  showType: ShowType;
  totalCommission: number;
  totalRevenue: number;
  totalTickets: number;
}

export interface TopGenres {
  genre: string;
  shows: {
    department: string;
    showId: string;
    title: string;
    totalCommission: number;
    totalRevenue: number;
    totalTickets: number;
    showType: ShowType;
  }[];
  totalCommission: number;
  totalRevenue: number;
  totalTickets: number;
}

interface KPISummary {
  closedSchedules: number;
  openSchedules: number;
  totalDepartments: number;
  totalDistributors: number;
  totalShows: number;
  upcomingShows: number;
}

interface UpcomingShows {
  department: string;
  earliestSchedule: string;
  genres: string[];
  showId: string;
  showType: ShowType;
  title: string;
  totalUpcomingSchedules: number;
}

export const useGetTopShowsByTicketsSold = (query?: { departmentId?: string; from?: string; to?: string }) => {
  return useQuery<TopShowByTicketsSold[], Error>({
    queryKey: ["dashboard", "ticketsSold", query?.departmentId, query?.from, query?.to].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopShowByTicketsSold[]>("/api/dashboard/top-shows/tickets", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopShowsByTotalRevenue = (query?: { departmentId?: string; from?: string; to?: string }) => {
  return useQuery<TopShowByTotalRevenue[], Error>({
    queryKey: ["dashboard", "totalRevenue", query?.departmentId, query?.from, query?.to].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopShowByTotalRevenue[]>("/api/dashboard/top-shows/revenue", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopGenres = (query?: { departmentId?: string; from?: string; to?: string }) => {
  return useQuery<TopGenres[], Error>({
    queryKey: ["dashboard", "genre", query?.departmentId, query?.from, query?.to].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopGenres[]>("/api/dashboard/top-shows/genre", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopDistributors = (query?: { departmentId?: string; from?: string; to?: string }) => {
  return useQuery<TopDistributors[], Error>({
    queryKey: ["dashboard", "distributors", query?.departmentId, query?.from, query?.to].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopDistributors[]>("/api/dashboard/top-distributors", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetKPISummary = (query?: { departmentId?: string }) => {
  return useQuery<KPISummary, Error>({
    queryKey: ["dashboard", "kpi", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<KPISummary>("/api/dashboard/kpi", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetUpcomingShows = (query?: { departmentId?: string; from?: string; to?: string }) => {
  return useQuery<UpcomingShows[], Error>({
    queryKey: ["dashboard", "upcoming", "shows", query?.departmentId, query?.from, query?.to].filter(Boolean),
    queryFn: async () => {
      const res = await request<UpcomingShows[]>("/api/dashboard/upcoming/shows", query, "get");
      return res.data;
    },
    retry: false,
  });
};

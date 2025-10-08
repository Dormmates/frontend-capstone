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

export const useGetTopShowsByTicketsSold = (query?: { departmentId?: string }) => {
  return useQuery<TopShowByTicketsSold[], Error>({
    queryKey: ["dashboard", "ticketsSold", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopShowByTicketsSold[]>("/api/dashboard/top-shows/tickets", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopShowsByTotalRevenue = (query?: { departmentId?: string }) => {
  return useQuery<TopShowByTotalRevenue[], Error>({
    queryKey: ["dashboard", "totalRevenue", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopShowByTotalRevenue[]>("/api/dashboard/top-shows/revenue", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopGenres = (query?: { departmentId?: string }) => {
  return useQuery<any, Error>({
    queryKey: ["dashboard", "genre", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<any>("/api/dashboard/top-shows/genre", query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetTopDistributors = (query?: { departmentId?: string }) => {
  return useQuery<TopDistributors[], Error>({
    queryKey: ["dashboard", "distributors", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<TopDistributors[]>("/api/dashboard/top-distributors", query, "get");
      return res.data;
    },
    retry: false,
  });
};

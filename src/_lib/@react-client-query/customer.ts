import { useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { ShowDataWithSchedules } from "@/types/show";

type UpcomingShows = {
  date: string;
  showCover: string;
  title: string;
  description: string;
  showId: string;
};

export const useGetLandingPageUpcomingShows = () => {
  return useQuery<UpcomingShows[], Error>({
    queryKey: ["upcomingShows"],
    queryFn: async () => {
      const res = await request<UpcomingShows[]>(`/api/customer/upcomingShows`, {}, "get");
      return res.data;
    },
  });
};

export const useGetDepartmentShows = (departmentId: string, query?: { isArchived?: boolean }) => {
  return useQuery<{ featuredShow: ShowDataWithSchedules; otherShows: ShowDataWithSchedules[] }, Error>({
    queryKey: ["department", "shows", departmentId],
    queryFn: async () => {
      const res = await request<{ featuredShow: ShowDataWithSchedules; otherShows: ShowDataWithSchedules[] }>(
        `/api/customer/department/${departmentId}`,
        query,
        "get"
      );
      return res.data;
    },
  });
};

export const useGetShowWithSchedules = (showId: string) => {
  return useQuery<ShowDataWithSchedules, Error>({
    queryKey: ["customer", "shows", showId],
    queryFn: async () => {
      const res = await request<ShowDataWithSchedules>(`/api/customer/show/${showId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetAvailableTickets = (scheduleId: string) => {
  return useQuery<number, Error>({
    queryKey: ["tickets", "available", scheduleId],
    queryFn: async () => {
      const res = await request<number>(`/api/customer/availableTickets/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

import { useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { ShowDataWithSchedules } from "@/types/show";

type UpcomingShows = {
  date: string;
  showCover: string;
  title: string;
  description: string;
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
  return useQuery<{ upcomingShows: ShowDataWithSchedules[]; pastShows: ShowDataWithSchedules[] }, Error>({
    queryKey: ["department", "shows", departmentId],
    queryFn: async () => {
      const res = await request<{ featuredShow: ShowDataWithSchedules; upcomingShows: ShowDataWithSchedules[]; pastShows: ShowDataWithSchedules[] }>(
        `/api/customer/department/${departmentId}`,
        query,
        "get"
      );
      return res.data;
    },
  });
};

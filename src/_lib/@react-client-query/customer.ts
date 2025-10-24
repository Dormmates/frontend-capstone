import { useQuery } from "@tanstack/react-query";
import { request } from "../api";

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

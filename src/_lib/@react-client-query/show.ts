import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { request } from "../api";
import type { NewShowPayload, ShowData, ShowType, UpdateShowPayload } from "../../types/show";
import type { DistributorScheduleTickets } from "../../types/ticket";
import type { SalesReport } from "@/types/salesreport";

export const useCreateShow = () => {
  return useMutation<ShowData, Error, NewShowPayload>({
    mutationFn: async (data: NewShowPayload) => {
      const res = await request<any>("/api/show", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUpdateShow = () => {
  return useMutation<ShowData, Error, UpdateShowPayload>({
    mutationFn: async (data: UpdateShowPayload) => {
      const res = await request<any>("/api/show", data, "patch");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShows = (query?: {
  departmentId?: string;
  showType?: ShowType;
  includeMajorProduction?: boolean;
  excludeArchived?: boolean;
  limit?: number;
}) => {
  return useQuery<ShowData[], Error>({
    queryKey: ["shows", query?.departmentId, query?.showType].filter(Boolean),
    queryFn: async () => {
      const res = await request<ShowData[]>(`/api/show`, query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShow = (id: string, options?: Omit<UseQueryOptions<ShowData, Error>, "queryKey" | "queryFn">) => {
  return useQuery<ShowData, Error>({
    queryKey: ["show", id],
    queryFn: async () => {
      const res = await request<ShowData>(`/api/show/${id}`, {}, "get");
      return res.data;
    },
    retry: false,
    ...options,
  });
};

export const useArchiveShow = () => {
  return useMutation<any, Error, { showId: string; actionById: string; actionByName: string }>({
    mutationFn: async (body: { showId: string; actionById: string; actionByName: string }) => {
      const res = await request<any>("/api/show/archive", body, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUnArchiveShow = () => {
  return useMutation<any, Error, { showId: string; actionById: string; actionByName: string }>({
    mutationFn: async (body: { showId: string; actionById: string; actionByName: string }) => {
      const res = await request<any>("/api/show/unarchive", body, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useDeleteShow = () => {
  return useMutation<any, Error, { showId: string; actionById: string; actionByName: string }>({
    mutationFn: async (body: { showId: string; actionById: string; actionByName: string }) => {
      const res = await request<any>("/api/show/delete", body, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShowsAndDistributorTickets = (distributorId: string) => {
  return useQuery<DistributorScheduleTickets[], Error>({
    queryKey: ["show and schedules", "distributor", distributorId],
    queryFn: async () => {
      const res = await request<DistributorScheduleTickets[]>(`/api/show/distributors/${distributorId}/tickets`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGenerateSalesReport = (showId: string, scheduleIds: string[]) => {
  return useQuery<SalesReport, Error>({
    queryKey: ["salesreport", showId, scheduleIds],
    queryFn: async () => {
      const queryString = scheduleIds.length ? `?scheduleIds=${scheduleIds.join(",")}` : "";
      const res = await request<SalesReport>(`/api/show/salesreport/${showId}${queryString}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

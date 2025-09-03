import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { NewShowPayload, ShowData, ShowType, UpdateShowPayload } from "../../types/show";
import type { DistributorScheduleTickets } from "../../types/ticket";

export const useCreateShow = () => {
  return useMutation<ShowData, Error, NewShowPayload>({
    mutationFn: async (data: NewShowPayload) => {
      const formData = new FormData();
      formData.append("showTitle", data.showTitle);
      formData.append("description", data.description);
      formData.append("genre", data.genre);

      if (data.department) {
        formData.append("department", data.department);
      }

      formData.append("createdBy", data.createdBy);
      formData.append("showType", data.showType);
      formData.append("image", data.image);

      const res = await request<any>("/api/show", data, "postFormData");

      return res.data;
    },
    retry: false,
  });
};

export const useUpdateShow = () => {
  return useMutation<ShowData, Error, UpdateShowPayload>({
    mutationFn: async (data: UpdateShowPayload) => {
      const formData = new FormData();
      formData.append("showTitle", data.showTitle);
      formData.append("description", data.description);
      formData.append("genre", data.genre);

      if (data.department) {
        formData.append("department", data.department);
      }

      formData.append("createdBy", data.createdBy);
      formData.append("showType", data.showType);
      formData.append("image", data.image);

      if (data.oldFileId) {
        formData.append("oldFileId", data.oldFileId);
      }

      const res = await request<any>("/api/show", data, "patchFormData");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShows = (query: { departmentId?: string; showType?: ShowType }) => {
  return useQuery<ShowData[], Error>({
    queryKey: ["shows", query.departmentId, query.showType].filter(Boolean),
    queryFn: async () => {
      const res = await request<ShowData[]>(`/api/show`, query, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShow = (id: string) => {
  return useQuery<ShowData, Error>({
    queryKey: ["show", id],
    queryFn: async () => {
      const res = await request<ShowData>(`/api/show/${id}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useArchiveShow = () => {
  return useMutation<any, Error, { showId: string }>({
    mutationFn: async (showId: { showId: string }) => {
      const res = await request<any>("/api/show/archive", showId, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUnArchiveShow = () => {
  return useMutation<any, Error, { showId: string }>({
    mutationFn: async (showId: { showId: string }) => {
      const res = await request<any>("/api/show/unarchive", showId, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useDeleteShow = () => {
  return useMutation<any, Error, { showId: string }>({
    mutationFn: async (showId: { showId: string }) => {
      const res = await request<any>("/api/show/delete", showId, "post");
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

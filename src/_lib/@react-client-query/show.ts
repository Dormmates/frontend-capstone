import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { NewShowPayload, ShowData, ShowList, UpdateShowPayload } from "../../types/show";

export const useCreateShow = () => {
  return useMutation<any, Error, NewShowPayload>({
    mutationFn: async (data: NewShowPayload) => {
      const formData = new FormData();
      formData.append("showTitle", data.showTitle);
      formData.append("description", data.description);
      formData.append("genre", data.genre);
      formData.append("department", data.department);
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
  return useMutation<any, Error, UpdateShowPayload>({
    mutationFn: async (data: UpdateShowPayload) => {
      const formData = new FormData();
      formData.append("showTitle", data.showTitle);
      formData.append("description", data.description);
      formData.append("genre", data.genre);
      formData.append("department", data.department);
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

export const useGetShows = (departmentId?: string) => {
  return useQuery<ShowList, Error>({
    queryKey: ["shows"],
    queryFn: async () => {
      const res = await request<ShowList>(`/api/show`, { departmentId }, "get");
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

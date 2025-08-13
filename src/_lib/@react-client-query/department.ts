import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { Department } from "../../types/department";

export const useGetDepartments = () => {
  return useQuery<Department[], Error>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await request<Department[]>("/api/department", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useAddDepartment = () => {
  return useMutation<any, Error, { name: string; image: File }>({
    mutationFn: async (data: { name: string; image: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("image", data.image);
      const res = await request<any>("/api/department", formData, "postFormData");

      return res.data;
    },
    retry: false,
  });
};

export const useEditDepartment = () => {
  return useMutation<any, Error, { departmentId: string; name: string; image?: File; oldFileId?: string }>({
    mutationFn: async (data: { departmentId: string; name: string; image?: File; oldFileId?: string }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("departmentId", data.departmentId);

      if (data.image) {
        formData.append("image", data.image);
      }

      if (data.oldFileId) {
        formData.append("oldFileId", data.oldFileId);
      }

      const res = await request<any>("/api/department", formData, "patchFormData");
      return res.data;
    },
  });
};

export const useDeleteDepartment = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (departmentId: string) => {
      const res = await request<any>(`/api/department/${departmentId}`, {}, "delete");
      return res.data;
    },
  });
};

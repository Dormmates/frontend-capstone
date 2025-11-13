import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { request } from "../api";
import type { Department } from "../../types/department";

export const useGetDepartments = (trainerId?: string | null, options?: Omit<UseQueryOptions<Department[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Department[], Error>({
    queryKey: ["departments", trainerId].filter(Boolean),
    queryFn: async () => {
      const res = await request<Department[]>("/api/department", { trainerId }, "get");
      return res.data;
    },
    retry: false,
    ...options,
  });
};

export const useGetDepartment = (departmentId: string) => {
  return useQuery<Department, Error>({
    queryKey: ["department", departmentId],
    queryFn: async () => {
      const res = await request<Department>(`/api/department/${departmentId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useAddDepartment = () => {
  return useMutation<any, Error, { name: string; imageUrl: string }>({
    mutationFn: async (data) => {
      const res = await request<any>("/api/department", data, "post");

      return res.data;
    },
    retry: false,
  });
};

export const useEditDepartment = () => {
  return useMutation<any, Error, { departmentId: string; name: string; oldFileId?: string; imageUrl?: string }>({
    mutationFn: async (data) => {
      const res = await request<any>("/api/department", data, "patch");
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

export const useAssingDepartmentTrainers = () => {
  return useMutation<any, Error, { trainers: string[]; departmentId: string }>({
    mutationFn: async (payload) => {
      const res = await request<any>(`/api/department/assign`, payload, "post");
      return res.data;
    },
  });
};

export const useCreateTrainerAndAssign = () => {
  return useMutation<any, Error, { firstName: string; lastName: string; email: string; departmentId: string }>({
    mutationFn: async (payload: { firstName: string; lastName: string; email: string; departmentId: string }) => {
      const res = await request<any>(`/api/department/createTrainerAndAssign`, payload, "post");
      return res.data;
    },
  });
};

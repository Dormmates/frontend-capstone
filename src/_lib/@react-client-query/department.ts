import { useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { Department } from "../../types/department";

interface DepartmentsData {
  departments: Department[];
}

export const useGetDepartments = () => {
  return useQuery<DepartmentsData, Error>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await request<DepartmentsData>("/api/department", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

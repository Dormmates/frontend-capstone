import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { Department } from "../../types/department";

interface NewShowPayload {
  showTitle: string;
  description: string;
  department: any;
  genre: string;
  createdBy: string;
  showType: any;
  image: File;
}

interface ShowData {
  showId: string;
  title: string;
  description: string;
  showType: "showCase" | "majorConcert" | "majorProduction";
  departmentId: string;
  department: {
    departmentId: string;
    name: string;
    trainerId: string;
  };
  createdBy: string;
  createdAt: string;
  isArchived: boolean;
  showCover: string;
  genreNames: string[];
  showschedules: any[];
}

interface ShowList {
  shows: {
    showId: string;
    title: string;
    showType: "showCase" | "majorConcert";
    department: Department;
    showCover: string;
  }[];
}

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

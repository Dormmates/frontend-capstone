import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";

export const useGetGenres = () => {
  return useQuery<{ name: string }[], Error>({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await request<{ name: string }[]>("/api/genres", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetGenresWithShowCount = () => {
  return useQuery<{ genre: string; showCount: number }[], Error>({
    queryKey: ["genres", "count"],
    queryFn: async () => {
      const res = await request<{ genre: string; showCount: number }[]>("/api/genres/count", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useAddGenre = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (genre: string) => {
      const res = await request<any>("/api/genres", { genre }, "post");
      return res.data;
    },
  });
};

export const useDeleteGenre = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (genre: string) => {
      const res = await request<any>("/api/genres", { genre }, "delete");
      return res.data;
    },
  });
};

export const useUpdateGenre = () => {
  return useMutation<any, Error, { oldGenre: string; newGenre: string }>({
    mutationFn: async (payload: { oldGenre: string; newGenre: string }) => {
      const res = await request<any>("/api/genres", payload, "patch");
      return res.data;
    },
  });
};

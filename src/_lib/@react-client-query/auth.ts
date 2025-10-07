import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { User } from "../../types/user";
import type { LoginPayload } from "../../types/auth";

export const useLogin = () => {
  return useMutation<User, Error, LoginPayload>({
    mutationFn: async (data: LoginPayload) => {
      const res = await request<User>("/api/auth/login", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUpdatePassword = () => {
  return useMutation<any, Error, { userId: string; newPassword: string }>({
    mutationFn: async (data: { userId: string; newPassword: string }) => {
      const res = await request<User>("/api/auth/updatePassword", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useChangePassword = () => {
  return useMutation<any, Error, { userId: string; currentPassword: string; newPassword: string }>({
    mutationFn: async (data: { userId: string; currentPassword: string; newPassword: string }) => {
      const res = await request<User>("/api/auth/changePassword", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useLogout = () => {
  return useMutation<any, Error, any>({
    mutationFn: async () => {
      const res = await request<any>("/api/auth/logout", {}, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useGetUserInformation = (options?: any) => {
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await request<User>("/api/auth/getUserInformation", {}, "get");
      return res.data;
    },
    retry: false,
    ...options,
  });
};

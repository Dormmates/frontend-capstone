import { useMutation, useQuery } from "@tanstack/react-query";
import type { Distributor, DistributorTypes, User } from "../../types/user";
import { request } from "../api";

interface NewTrainerPayload {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
}

interface NewDistributorPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  distributorType: number;
  contactNumber: string;
  departmentId: string;
}

interface EditTrainerPayload extends NewTrainerPayload {
  userId: string;
}

interface EditDistributorPayload extends NewDistributorPayload {
  userId: string;
}

export const useGetTrainers = () => {
  return useQuery<User[], Error>({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await request<User[]>("/api/accounts/trainers", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetDistributors = (departmentId?: string) => {
  return useQuery<Distributor[], Error>({
    queryKey: ["distributors"],
    queryFn: async () => {
      const res = await request<Distributor[]>("/api/accounts/distributors", { departmentId }, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetDistributorTypes = () => {
  return useQuery<DistributorTypes[], Error>({
    queryKey: ["distributor", "types"],
    queryFn: async () => {
      const res = await request<DistributorTypes[]>("/api/accounts/distributorTypes", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useNewTrainer = () => {
  return useMutation<any, Error, NewTrainerPayload>({
    mutationFn: async (data: NewTrainerPayload) => {
      const res = await request<any>("/api/accounts/trainer", data, "post");
      return res.data;
    },
  });
};

export const useNewDistributor = () => {
  return useMutation<any, Error, NewDistributorPayload>({
    mutationFn: async (data: NewDistributorPayload) => {
      const res = await request<any>("/api/accounts/distributor", data, "post");
      return res.data;
    },
  });
};

export const useEditTrainer = () => {
  return useMutation<any, Error, EditTrainerPayload>({
    mutationFn: async (data: EditTrainerPayload) => {
      const res = await request<any>("/api/accounts/trainer", data, "patch");
      return res.data;
    },
  });
};

export const useEditDistributor = () => {
  return useMutation<any, Error, EditDistributorPayload>({
    mutationFn: async (data: EditDistributorPayload) => {
      const res = await request<any>("/api/accounts/distributor", data, "patch");
      return res.data;
    },
  });
};

export const useDeleteUser = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (userId: string) => {
      const res = await request<any>("/api/accounts/delete/user", { userId }, "post");
      return res.data;
    },
  });
};

export const useUnArchiveAccount = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (userId: string) => {
      const res = await request<any>("/api/accounts/unArchive/user", { userId }, "post");
      return res.data;
    },
  });
};

export const useArchiveAccount = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (userId: string) => {
      const res = await request<any>("/api/accounts/archive/user", { userId }, "post");
      return res.data;
    },
  });
};

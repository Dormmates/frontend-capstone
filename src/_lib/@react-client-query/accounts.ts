import { useMutation, useQuery } from "@tanstack/react-query";
import type { Distributor, DistributorTypes, User } from "../../types/user";
import { request } from "../api";

interface NewTrainerPayload {
  firstName: string;
  lastName: string;
  email: string;
}

interface NewDistributorPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  distributorType: DistributorTypes;
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

export const useGetDistributors = (query?: { departmentId?: string; excludeCCA?: boolean; includeOtherTypes?: boolean }) => {
  return useQuery<Distributor[], Error>({
    queryKey: ["distributors", query?.departmentId].filter(Boolean),
    queryFn: async () => {
      const res = await request<Distributor[]>("/api/accounts/distributors", query, "get");
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

export const useGetDistributorData = (id: string) => {
  return useQuery<Distributor, Error>({
    queryKey: ["distributor", id],
    queryFn: async () => {
      const res = await request<Distributor>(`/api/accounts/distributor/${id}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetCCAHeads = () => {
  return useQuery<User[], Error>({
    queryKey: ["heads"],
    queryFn: async () => {
      const res = await request<User[]>("/api/accounts/heads", {}, "get");
      return res.data;
    },
  });
};

export const useAddCCARole = () => {
  return useMutation<any, Error, string[]>({
    mutationFn: async (userIds: string[]) => {
      const res = await request<any>("/api/accounts/role/head", { userIds }, "post");
      return res.data;
    },
  });
};

export const useNewCCAHead = () => {
  return useMutation<any, Error, Omit<NewTrainerPayload, "departmentId">>({
    mutationFn: async (payload: Omit<NewTrainerPayload, "departmentId">) => {
      const res = await request<any>("/api/accounts/head", payload, "post");
      return res.data;
    },
  });
};

export const useRemoveCCAHeadRole = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (userId: string) => {
      const res = await request<any>("/api/accounts/role/delete/head", { userId }, "post");
      return res.data;
    },
  });
};

export const useGetEmails = () => {
  return useQuery<string[], Error>({
    queryKey: ["emails"],
    queryFn: async () => {
      const res = await request<string[]>("/api/accounts/emails", {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useCreateBulkDistributors = () => {
  return useMutation<
    { message: string; summary: { name: string; email: string; status: string }[] },
    Error,
    { distributors: { firstName: string; lastName: string; email: string; contactNumber: string }[]; performingGroup: string }
  >({
    mutationFn: async (payload: {
      distributors: { firstName: string; lastName: string; email: string; contactNumber: string }[];
      performingGroup: string;
    }) => {
      const res = await request<{ message: string; summary: { name: string; email: string; status: string }[] }>(
        "/api/accounts/bulk/distributor",
        payload,
        "post"
      );
      return res.data;
    },
    retry: false,
  });
};

export const useResetPassword = () => {
  return useMutation<any, Error, { userId: string }>({
    mutationFn: async (payload) => {
      const result = await request<any>("/api/accounts/password/reset", payload, "post");
      return result.data;
    },
  });
};

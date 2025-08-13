import { useMutation, useQuery } from "@tanstack/react-query";
import type { Trainer } from "../../types/user";
import { request } from "../api";

interface NewTrainerPayload {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
}

interface EditTrainerPayload extends NewTrainerPayload {
  userId: string;
}

export const useGetTrainers = () => {
  return useQuery<Trainer[], Error>({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await request<Trainer[]>("/api/accounts/trainers", {}, "get");
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

export const useEditTrainer = () => {
  return useMutation<any, Error, EditTrainerPayload>({
    mutationFn: async (data: EditTrainerPayload) => {
      const res = await request<any>("/api/accounts/trainer", data, "patch");
      return res.data;
    },
  });
};

import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { FixedPricing, SectionedPricing, TicketPricing } from "@/types/ticketpricing";

export const useAddNewFixedTicketPricing = () => {
  return useMutation<any, string, Omit<FixedPricing, "id">>({
    mutationFn: async (payload: Omit<FixedPricing, "id">) => {
      const res = await request<any>("/api/pricing", payload, "post");
      return res.data;
    },
  });
};

export const useAddNewSectionedTicketPricing = () => {
  return useMutation<any, string, Omit<SectionedPricing, "id">>({
    mutationFn: async (payload: Omit<SectionedPricing, "id">) => {
      const res = await request<any>("/api/pricing", payload, "post");
      return res.data;
    },
  });
};

export const useGetTicketPrices = () => {
  return useQuery<TicketPricing[], Error>({
    queryKey: ["pricings"],
    queryFn: async () => {
      const res = await request<TicketPricing[]>("/api/pricing", {}, "get");
      return res.data;
    },
  });
};

export const useUpdateFixedPricing = () => {
  return useMutation<any, Error, FixedPricing>({
    mutationFn: async (payload: FixedPricing) => {
      const res = await request<any>("/api/pricing/fixed", payload, "patch");
      return res.data;
    },
  });
};

export const useUpdateSectionedPricing = () => {
  return useMutation<any, Error, SectionedPricing>({
    mutationFn: async (payload: SectionedPricing) => {
      const res = await request<any>("/api/pricing/sectioned", payload, "patch");
      return res.data;
    },
  });
};

export const useDeleteSectionedPricing = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      const res = await request<any>("/api/pricing/sectioned", { id }, "delete");
      return res.data;
    },
  });
};

export const useDeleteFixedPricing = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      const res = await request<any>("/api/pricing/fixed", { id }, "delete");
      return res.data;
    },
  });
};

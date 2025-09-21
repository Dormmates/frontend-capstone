import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { FixedPricing, SectionedPricing, TicketPricing } from "@/types/ticketpricing";

export const useAddNewFixedTicketPricing = () => {
  return useMutation<any, string, FixedPricing>({
    mutationFn: async (payload: FixedPricing) => {
      const res = await request<any>("/api/pricing", payload, "post");
      return res.data;
    },
  });
};

export const useAddNewSectionedTicketPricing = () => {
  return useMutation<any, string, SectionedPricing>({
    mutationFn: async (payload: SectionedPricing) => {
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

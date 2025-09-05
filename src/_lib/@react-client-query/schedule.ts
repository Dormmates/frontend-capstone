import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";

import type { ScheduleFormData, Schedule, ScheduleSummary } from "../../types/schedule";
import type { FlattenedSeat } from "../../types/seat";
import type { AllocatedTicketToDistributor, AllocationHistory, RemittanceHistory, Ticket } from "../../types/ticket";

export interface AddSchedulePayload extends ScheduleFormData {
  showId: string;
  controlNumbers?: { orchestra: number[]; balcony: number[]; complimentary: number[] };
  ticketPrice?: number;
  sectionedPrice?: {
    orchestraLeft: number;
    orchestraMiddle: number;
    orchestraRight: number;
    balconyLeft: number;
    balconyMiddle: number;
    balconyRight: number;
  };
  seats?: FlattenedSeat[];
}

export const useAddSchedule = () => {
  return useMutation<Schedule[], Error, AddSchedulePayload>({
    mutationFn: async (payLoad: AddSchedulePayload) => {
      const res = await request<Schedule[]>("/api/schedule", payLoad, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useCloseSchedule = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (scheduleId: string) => {
      const res = await request<any>("/api/schedule/closeSchedule", { scheduleId }, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useOpenSchedule = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (scheduleId: string) => {
      const res = await request<any>("/api/schedule/openSchedule", { scheduleId }, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useDeleteSchedule = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (scheduleId: string) => {
      const res = await request<any>("/api/schedule/deleteSchedule", { scheduleId }, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useReschedule = () => {
  return useMutation<any, Error, { scheduleId: string; newDateTime: Date }>({
    mutationFn: async (data: { scheduleId: string; newDateTime: Date }) => {
      const res = await request<any>("/api/schedule/reschedule", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShowSchedules = (showId: string) => {
  return useQuery<Schedule[], Error>({
    queryKey: ["schedules", showId],
    queryFn: async () => {
      const res = await request<Schedule[]>("/api/schedule", { showId }, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetScheduleInformation = (scheduleId: string) => {
  return useQuery<Schedule, Error>({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const res = await request<Schedule>(`/api/schedule/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetScheduleSummary = (scheduleId: string) => {
  return useQuery<ScheduleSummary, Error>({
    queryKey: ["schedule", "summary", scheduleId],
    queryFn: async () => {
      const res = await request<ScheduleSummary>(`/api/schedule/summary/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};
export const useGetScheduleTickets = (scheduleId: string) => {
  return useQuery<Ticket[], Error>({
    queryKey: ["schedule", "tickets", scheduleId],
    queryFn: async () => {
      const res = await request<Ticket[]>(`/api/schedule/tickets/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetScheduleDistributors = (scheduleId: string) => {
  return useQuery<
    {
      userId: string;
      name: string;
      totalAllocated: number;
      totalSold: number;
      email: string;
      department: string;
      distributorType: string;
    }[],
    Error
  >({
    queryKey: ["schedule", "distributors", scheduleId],
    queryFn: async () => {
      const res = await request<
        {
          userId: string;
          name: string;
          totalAllocated: number;
          totalSold: number;
          email: string;
          department: string;
          distributorType: string;
        }[]
      >(`/api/schedule/distributors/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetScheduleSeatMap = (scheduleId: string) => {
  return useQuery<FlattenedSeat[], Error>({
    queryKey: ["schedule", "seatmap", scheduleId],
    queryFn: async () => {
      const res = await request<FlattenedSeat[]>(`/api/schedule/seatmap/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useAllocateTicketByControlNumber = () => {
  return useMutation<any, Error, { distributorId: string; scheduleId: string; controlNumbers: number[]; allocatedBy: string }>({
    mutationFn: async (payload: { distributorId: string; scheduleId: string; controlNumbers: number[]; allocatedBy: string }) => {
      const res = await request<any>(`/api/schedule/allocate/controlNumber/`, payload, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUnAllocateTicket = () => {
  return useMutation<any, Error, { distributorId: string; scheduleId: string; controlNumbers: number[]; unallocatedBy: string }>({
    mutationFn: async (payload: { distributorId: string; scheduleId: string; controlNumbers: number[]; unallocatedBy: string }) => {
      const res = await request<any>(`/api/schedule/unallocate/controlNumber/`, payload, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useGetDistributorAllocationHistory = (distributorId: string, scheduleId: string) => {
  return useQuery<AllocationHistory[], Error>({
    queryKey: ["schedule", "allocationHistory", scheduleId, distributorId],
    queryFn: async () => {
      const res = await request<AllocationHistory[]>(`/api/schedule/${scheduleId}/allocationHistory/${distributorId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetAllDistributorAllocationHistory = (distributorId: string) => {
  return useQuery<AllocationHistory[], Error>({
    queryKey: ["allocationHistory", distributorId],
    queryFn: async () => {
      const res = await request<AllocationHistory[]>(`/api/schedule/allocationHistory/${distributorId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetDistributorRemittanceHistory = (distributorId: string, scheduleId: string) => {
  return useQuery<RemittanceHistory[], Error>({
    queryKey: ["schedule", "remittanceHistory", scheduleId, distributorId],
    queryFn: async () => {
      const res = await request<RemittanceHistory[]>(`/api/schedule/${scheduleId}/remittanceHistory/${distributorId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetAllDistributorRemittanceHistory = (distributorId: string) => {
  return useQuery<RemittanceHistory[], Error>({
    queryKey: ["remittanceHistory", distributorId],
    queryFn: async () => {
      const res = await request<RemittanceHistory[]>(`/api/schedule/remittanceHistory/${distributorId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};
export const useGetAllocatedTicketsOfDistributor = (distributorId: string, scheduleId: string) => {
  return useQuery<AllocatedTicketToDistributor[], Error>({
    queryKey: ["schedule", "allocated", scheduleId, distributorId],
    queryFn: async () => {
      const res = await request<AllocatedTicketToDistributor[]>(`/api/schedule/${scheduleId}/ticketAllocated/${distributorId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useMarkTicketAsSold = () => {
  return useMutation<
    any,
    Error,
    { distributorId: string; scheduleId: string; controlNumbers: number[]; customerName?: string; email?: string; isIncluded: boolean }
  >({
    mutationFn: async (data: {
      distributorId: string;
      scheduleId: string;
      controlNumbers: number[];
      customerName?: string;
      email?: string;
      isIncluded: boolean;
    }) => {
      const res = await request<any>("/api/schedule/markSold", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useMarkTicketAsUnSold = () => {
  return useMutation<any, Error, { distributorId: string; scheduleId: string; controlNumbers: number[] }>({
    mutationFn: async (data: { distributorId: string; scheduleId: string; controlNumbers: number[] }) => {
      const res = await request<any>("/api/schedule/markUnsold", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useRemitTicketSale = () => {
  return useMutation<
    any,
    Error,
    {
      sold: number[];
      lost: number[];
      discounted?: number[];
      discountPercentage?: number;
      scheduleId: string;
      distributorId: string;
      remarks?: string;
      actionBy: string;
    }
  >({
    mutationFn: async (data: {
      sold: number[];
      lost: number[];
      discounted?: number[];
      discountPercentage?: number;
      scheduleId: string;
      distributorId: string;
      remarks?: string;
      actionBy: string;
    }) => {
      const res = await request<any>("/api/schedule/remit", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useUnRemitTicketSales = () => {
  return useMutation<
    any,
    Error,
    {
      remittedTickets: number[];
      scheduleId: string;
      distributorId: string;
      actionBy: string;
      remarks?: string | null;
    }
  >({
    mutationFn: async (data: { remittedTickets: number[]; scheduleId: string; distributorId: string; actionBy: string; remarks?: string | null }) => {
      const res = await request<any>("/api/schedule/unremit", data, "post");
      return res.data;
    },
    retry: false,
  });
};

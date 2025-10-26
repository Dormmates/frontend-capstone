import { useMutation, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { request } from "../api";

import type { ScheduleFormData, Schedule, ScheduleSummary, DistributorTicketActivities } from "../../types/schedule";
import type { FlattenedSeat } from "../../types/seat";
import type { AllocatedTicketToDistributor, AllocationHistory, RemittanceHistory, Ticket, TicketLog, TicketStatuses } from "../../types/ticket";
import type { TicketPricing } from "@/types/ticketpricing";

export interface ScheduleDistributorForAllocation {
  userId: string;
  firstName: string;
  lastName: string;
  department: {
    name: string;
    id: string | null;
  };
  distributorType: string;
  tickets: { controlNumber: number; status: TicketStatuses }[];
}

export interface AddSchedulePayload extends ScheduleFormData {
  showId: string;
  controlNumbers?: { tickets: number[]; complimentary: number[] };
  seats?: FlattenedSeat[];
  ticketPricing: TicketPricing;
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

export const useCopySchedule = () => {
  return useMutation<Schedule, Error, { scheduleId: string; newDateTime: Date }>({
    mutationFn: async (data: { scheduleId: string; newDateTime: Date }) => {
      const res = await request<Schedule>("/api/schedule/copy", data, "post");
      return res.data;
    },
    retry: false,
  });
};

export const useGetShowSchedules = (showId: string, query?: { excludeClosed?: boolean; excludeReservationOff?: boolean }) => {
  return useQuery<Schedule[], Error>({
    queryKey: ["schedules", showId],
    queryFn: async () => {
      const res = await request<Schedule[]>("/api/schedule", { showId, ...query }, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetScheduleInformation = (scheduleId: string, options?: { enabled?: boolean }) => {
  return useQuery<Schedule, Error>({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const res = await request<Schedule>(`/api/schedule/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
    enabled: options?.enabled ?? true,
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
export const useGetScheduleTickets = (scheduleId: string, options?: Omit<UseQueryOptions<Ticket[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Ticket[], Error>({
    queryKey: ["schedule", "tickets", scheduleId],
    queryFn: async () => {
      const res = await request<Ticket[]>(`/api/schedule/tickets/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
    ...options,
  });
};

export const useGetTicketLogs = (scheduleId: string, controlNumber: number) => {
  return useQuery<TicketLog[], Error>({
    queryKey: ["ticket", "log", controlNumber, scheduleId],
    queryFn: async () => {
      const res = await request<TicketLog[]>(`/api/schedule/ticket/logs/${scheduleId}/${controlNumber}`, {}, "get");
      return res.data;
    },
  });
};

export const useGenerateTicketInformation = (scheduleId: string) => {
  return useQuery<{ distributorName: string; controlNumber: number; currentStatus: TicketStatuses; isComplimentary: boolean }[], Error>({
    queryKey: ["ticket", "informations", scheduleId],
    queryFn: async () => {
      const res = await request<{ distributorName: string; controlNumber: number; currentStatus: TicketStatuses; isComplimentary: boolean }[]>(
        `/api/schedule/ticket/informations/${scheduleId}`,
        {},
        "get"
      );
      return res.data;
    },
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
      department: {
        name: string;
        id: string;
      };
      distributorType: string;
      ticketControlNumbers: number[];
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
          department: { name: string; id: string };
          distributorType: string;
          ticketControlNumbers: number[];
        }[]
      >(`/api/schedule/distributors/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useGetDistributorsForAllocation = (scheduleId: string, departmentId: string) => {
  return useQuery<ScheduleDistributorForAllocation[], Error>({
    queryKey: ["schedule", "distributors", "allocation"],
    queryFn: async () => {
      const res = await request<ScheduleDistributorForAllocation[]>(`/api/schedule/distributors/${scheduleId}/allocation`, { departmentId }, "get");
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

export const useAllocateTicketToMultipleDistributors = () => {
  return useMutation<
    any,
    Error,
    { scheduleId: string; allocatedBy: string; allocations: { distributorId: string; ticketCount: number; name: string }[] }
  >({
    mutationFn: async (payload: {
      scheduleId: string;
      allocatedBy: string;
      allocations: { distributorId: string; ticketCount: number; name: string }[];
    }) => {
      const res = await request<any>(`/api/schedule/allocate/multiple/`, payload, "post");
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

export const useUpdateTallyData = () => {
  return useMutation<any, Error, { femaleCount: number; maleCount: number; scheduleId: string }>({
    mutationFn: async (payload) => {
      const res = await request<any>("/api/schedule/tallyData", payload, "post");
      return res.data;
    },
  });
};

export const useGetTallyData = (scheduleId: string) => {
  return useQuery<{ femaleCount: number; maleCount: number }, Error>({
    queryKey: ["schedule", "tallyData", scheduleId],
    queryFn: async () => {
      const res = await request<{ femaleCount: number; maleCount: number }>(`/api/schedule/tallyData/${scheduleId}`, {}, "get");
      return res.data;
    },
  });
};

export const useGetDistributorTicketActivities = (scheduleId: string) => {
  return useQuery<DistributorTicketActivities[], Error>({
    queryKey: ["schedule", "logs", "distributorActivites", scheduleId],
    queryFn: async () => {
      const res = await request<DistributorTicketActivities[]>(`/api/schedule/logs/distributorActivites/${scheduleId}`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useTrainerSellTicket = () => {
  return useMutation<any, Error, { scheduleId: string; controlNumber: number; trainerId: string; customerEmail?: string; customerName?: string }>({
    mutationFn: async (payload) => {
      const res = await request(`/api/schedule/sell/ticket`, payload, "post");
      return res.data;
    },
  });
};

export const useRefundTicket = () => {
  return useMutation<any, Error, { scheduleId: string; controlNumber: number; trainerId: string; distributorId: string; remarks: string }>({
    mutationFn: async (payload) => {
      const res = await request(`/api/schedule/refund`, payload, "post");
      return res.data;
    },
  });
};

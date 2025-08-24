import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";

import type { ScheduleFormData, Schedule, ScheduleSummary } from "../../types/schedule";
import type { FlattenedSeat, FlattenedSeatMap } from "../../types/seat";
import type { AllocatedTicketToDistributor, Ticket } from "../../types/ticket";

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
  seats?: FlattenedSeatMap;
}

export const useAddSchedule = () => {
  return useMutation<Schedule[], Error, AddSchedulePayload>({
    mutationFn: async (payLoad: AddSchedulePayload) => {
      const res = await request<Schedule[]>("/api/schedule", payLoad, "post");
      return res.data;
    },
  });
};

export const useGetShowSchedules = (showId: string) => {
  return useQuery<Schedule[], Error>({
    queryKey: ["schedules", showId],
    queryFn: async () => {
      const res = await request<Schedule[]>("/api/schedule", { showId }, "get");
      return res.data;
    },
  });
};

export const useGetScheduleInformation = (scheduleId: string) => {
  return useQuery<Schedule, Error>({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const res = await request<Schedule>(`/api/schedule/${scheduleId}`, {}, "get");
      return res.data;
    },
  });
};

export const useGetScheduleSummary = (scheduleId: string) => {
  return useQuery<ScheduleSummary, Error>({
    queryKey: ["schedule", "summary", scheduleId],
    queryFn: async () => {
      const res = await request<ScheduleSummary>(`/api/schedule/summary/${scheduleId}`, {}, "get");
      return res.data;
    },
  });
};
export const useGetScheduleTickets = (scheduleId: string) => {
  return useQuery<Ticket[], Error>({
    queryKey: ["schedule", "tickets", scheduleId],
    queryFn: async () => {
      const res = await request<Ticket[]>(`/api/schedule/tickets/${scheduleId}`, {}, "get");
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

export const useGetAllocatedTicketsOfDistributor = (distributorId: string, scheduleId: string) => {
  return useQuery<AllocatedTicketToDistributor[], Error>({
    queryKey: ["schedule", "allocated", scheduleId, distributorId],
    queryFn: async () => {
      const res = await request<AllocatedTicketToDistributor[]>(`/api/schedule/${scheduleId}/ticketAllocated/${distributorId}`, {}, "get");
      return res.data;
    },
  });
};

import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";

import type { ScheduleFormData, Schedule, ScheduleSummary } from "../../types/schedule";
import type { FlattenedSeatMap } from "../../types/seat";
import type { Ticket } from "../../types/ticket";

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
  return useMutation<any, Error, AddSchedulePayload>({
    mutationFn: async (payLoad: AddSchedulePayload) => {
      const res = await request("/api/schedule", payLoad, "post");
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

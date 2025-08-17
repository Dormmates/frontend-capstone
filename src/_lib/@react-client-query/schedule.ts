import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api";

import type { ScheduleFormData, ScheduleInformation, ScheduleSummary, SeatingConfiguration, TicketType } from "../../types/schedule";
import type { FlattenedSeatMap } from "../../types/seat";

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

interface ShowSchedule {
  commissionFee: string;
  contactNumber: number;
  datetime: string;
  facebookLink: number;
  femaleCount: number;
  isArchived: boolean;
  isOpen: boolean;
  isRescheduled: boolean;
  maleCount: number;
  scheduleId: string;
  seatingType: SeatingConfiguration;
  showId: string;
  ticketType: TicketType;
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
  return useQuery<{ schedules: ShowSchedule[] }, Error>({
    queryKey: ["schedules", showId],
    queryFn: async () => {
      const res = await request<{ schedules: ShowSchedule[] }>("/api/schedule", { showId }, "get");
      return res.data;
    },
  });
};

export const useGetScheduleInformation = (scheduleId: string) => {
  return useQuery<ScheduleInformation, Error>({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const res = await request<ScheduleInformation>(`/api/schedule/${scheduleId}`, {}, "get");
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

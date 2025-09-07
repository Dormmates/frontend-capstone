import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { request } from "../api";
import type { Notification } from "@/types/notification";

export type NotificationInfiniteScroll = {
  success: boolean;
  data: Notification[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};

export const useGetUserNotifications = (userId: string, limit = 10) => {
  return useInfiniteQuery<NotificationInfiniteScroll, Error>({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam }) => {
      const res = await request<NotificationInfiniteScroll>(`/api/notification/user/${userId}`, { cursor: pageParam, limit }, "get");
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.nextCursor : undefined;
    },
  });
};

export const useGetUnreadNotificationCount = (userId: string) => {
  return useQuery<number, Error>({
    queryKey: ["notification", "unread", userId],
    queryFn: async () => {
      const res = await request<number>(`/api/notification/user/${userId}/unread`, {}, "get");
      return res.data;
    },
    retry: false,
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation<Notification, Error, string>({
    mutationFn: async (notificationId: string) => {
      const res = await request<Notification>("/api/notification/read/", { notificationId }, "post");
      return res.data;
    },
    retry: false,
  });
};

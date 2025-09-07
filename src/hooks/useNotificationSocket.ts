import { useEffect } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../socket.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import type { Notification } from "@/types/notification.ts";

export const useNotificationSocket = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.userId) return;

    connectSocket(user.userId);
    const socket = getSocket();

    socket?.on("notification:new", (notif: Notification) => {
      toast(notif.title, {
        description: notif.message,
        duration: 5000,
      });

      queryClient.setQueryData<number>(["notification", "unread", user.userId], (oldCount) => (oldCount ?? 0) + 1);
      queryClient.setQueryData<Notification[]>(["notification", user.userId], (oldData) => (oldData ? [notif, ...oldData] : [notif]));

      switch (notif.type) {
        case "createMajorProduction":
        case "deleteShow":
        case "archiveShow":
        case "unarchiveShow":
        case "createShow": {
          queryClient.invalidateQueries({ queryKey: ["shows"] });
          queryClient.invalidateQueries({ queryKey: ["shows", "majorProduction"] });
          break;
        }
        case "addSchedule":
        case "closeSchedule":
        case "openSchedule":
        case "deleteSchedule":
        case "allocateTicket":
        case "unallocateTicket":
        case "remitTicket":
        case "unremitTicket":
        case "soldTicket":
        case "unsoldTicket":
        case "addHeadRole":
      }
    });

    return () => {
      socket?.off("notification:new");
      disconnectSocket();
    };
  }, [user?.userId, queryClient]);
};

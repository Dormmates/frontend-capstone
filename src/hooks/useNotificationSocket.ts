import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import Pusher from "pusher-js";
import type { Notification } from "@/types/notification.ts";

let pusher: Pusher | null = null;

export const useNotificationSocket = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.userId) {
      if (pusher) {
        pusher.disconnect();
        pusher = null;
      }
      return;
    }

    if (!pusher) {
      pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        forceTLS: true,
      });
    }

    const channel = pusher.subscribe(`user-${user.userId}`);

    const handleNotification = (notif: Notification) => {
      toast(notif.title, {
        description: notif.message,
        duration: 100000000,
        closeButton: true,
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
        case "soldTicket":
        case "unsoldTicket": {
          queryClient.invalidateQueries({ queryKey: ["schedule", "logs", "distributorActivites", notif.metaData?.scheduleId as string] });
          break;
        }
      }
    };

    channel.bind("notification:new", handleNotification);

    return () => {
      if (pusher && user.userId) {
        channel.unbind("notification:new", handleNotification);
        pusher.unsubscribe(`user-${user.userId}`);
      }
    };
  }, [user?.userId, queryClient]);
};

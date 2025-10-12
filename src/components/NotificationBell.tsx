import {
  useGetUnreadNotificationCount,
  useGetUserNotifications,
  useMarkNotificationAsRead,
  type NotificationInfiniteScroll,
} from "@/_lib/@react-client-query/notification";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash, Archive, Calendar, Ticket, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthContext } from "@/context/AuthContext";
import { Badge } from "./ui/badge";
import type { JSX } from "react";
import { formatToReadableDate, formatToReadableTime } from "@/utils/date";
import { Label } from "./ui/label";
import { Link } from "react-router-dom";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Notification } from "@/types/notification";
import { formatCurrency } from "@/utils";

const iconMap: Record<string, JSX.Element> = {
  createShow: <PlusCircle size={24} />,
  createMajorProduction: <PlusCircle size={24} />,
  deleteShow: <Trash size={24} />,
  archiveShow: <Archive size={24} />,
  unarchiveShow: <Archive size={24} />,
  addSchedule: <Calendar size={24} />,
  closeSchedule: <Calendar size={24} />,
  openSchedule: <Calendar size={24} />,
  deleteSchedule: <Trash size={24} />,
  allocateTicket: <Ticket size={24} />,
  unallocateTicket: <Ticket size={24} />,
  remitTicket: <Ticket size={24} />,
  unremitTicket: <Ticket size={24} />,
  soldTicket: <Ticket size={24} />,
  unsoldTicket: <Ticket size={24} />,
  addHeadRole: <UserPlus size={24} />,
};

const NotificationBell = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative flex justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
          </svg>
          <UnreadCount />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-80 max-h-[800px] p-0 overflow-hidden">
        <div className="space-y-2">
          <h4 className="leading-none font-medium m-4">Notifications</h4>
        </div>
        <div className="flex w-full flex-col gap-2 overflow-y-auto overflow-x-hidden max-h-[500px]">
          <NotificationContent />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const NotificationContent = () => {
  const { user } = useAuthContext();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetUserNotifications(user?.userId as string);

  const queryClient = useQueryClient();
  const markAsRead = useMarkNotificationAsRead();

  const allNotifications = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError || !data) {
    return <h1>Error loading</h1>;
  }

  const handleRead = (notification: Notification) => {
    if (notification.readAt) {
      return;
    }

    markAsRead.mutate(notification.notificationId, {
      onSuccess: () => {
        queryClient.setQueryData(["notifications", user?.userId], (oldData: InfiniteData<NotificationInfiniteScroll> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((notif: Notification) =>
                notif.notificationId === notification.notificationId ? { ...notif, readAt: new Date() } : notif
              ),
            })),
          };
        });

        queryClient.setQueryData<number>(["notification", "unread", user?.userId], (oldCount) => (oldCount ? Math.max(oldCount - 1, 0) : 0));
      },
    });
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="px-3 py-2 text-muted-foreground">
        Total: {allNotifications.length}
        {hasNextPage && " (more to load)"}
      </Label>

      {allNotifications.map((notification) => {
        const isRead = !!notification.readAt;
        const textColor = isRead ? "text-muted-foreground" : "text-black";

        return (
          <div key={notification.notificationId} className="flex flex-col border-b pb-2">
            <Popover>
              <PopoverTrigger>
                <Button variant="link" className="w-full p-3 text-left flex flex-col items-start mt-4" onClick={() => handleRead(notification)}>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col">
                      <p className={`${textColor} font-semibold flex gap-2 items-center `}>
                        {iconMap[notification.type]}
                        <p className={`break-words truncate max-w-[250px]`}>{notification.title}</p>
                      </p>
                      <p className={`${textColor} text-sm`}>
                        {formatToReadableDate(notification.sentAt)} {formatToReadableTime(notification.sentAt)}
                      </p>
                    </div>
                    {!isRead && <div className="bg-blue-400 w-2 h-2 rounded-full mt-1" />}
                  </div>
                  <p className={`${textColor} text-sm line-clamp-2 mt-1`}>{notification.message}</p>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-3">
                  <h4 className="leading-none font-medium">{notification.title}</h4>
                  <p className="text-muted-foreground text-sm">{notification.message}</p>

                  {notification.type === "createShow" && notification.metaData?.showId && (
                    <Link to={`/shows/${notification.metaData.showId}`}>
                      <Button>View Show</Button>
                    </Link>
                  )}

                  {(notification.type === "soldTicket" || notification.type === "unsoldTicket") && notification.metaData?.scheduleId && (
                    <Link to={`/shows/schedule/${notification.metaData.showId}/${notification.metaData.scheduleId}/#logs`}>
                      <Button>View Detailed Log</Button>
                    </Link>
                  )}

                  {notification.type === "remitTicket" && notification.metaData?.amountRemitted && notification.metaData?.totalCommission && (
                    <div className="flex flex-col text-sm text-foreground">
                      <p>Total Remitted: {formatCurrency(Number(notification.metaData.amountRemitted))}</p>
                      <p>Total Commission: {formatCurrency(Number(notification.metaData.totalCommission))}</p>
                      {notification.metaData?.remarks && (
                        <p className="break-words flex flex-col">
                          <span>Remarks:</span>
                          <span>
                            "<span className="font-medium">{notification.metaData.remarks}</span>"
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {notification.type === "unremitTicket" && (
                    <div className="flex flex-col text-sm text-foreground">
                      {notification.metaData?.remarks && (
                        <p className="break-words flex flex-col">
                          <span>Remarks:</span>
                          <span>
                            "<span className="font-medium">{notification.metaData.remarks}</span>"
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      })}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={isFetchingNextPage} variant="link">
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

const UnreadCount = () => {
  const { user } = useAuthContext();
  const { data, isLoading, isError } = useGetUnreadNotificationCount(user?.userId as string);

  if (isLoading) {
    return <p className="absolute "></p>;
  }

  if (isError || !data) {
    return <p className="absolute"></p>;
  }

  return (
    <Badge className="rounded-full absolute -bottom-2 -right-2" variant="destructive">
      {data}
    </Badge>
  );
};

export default NotificationBell;

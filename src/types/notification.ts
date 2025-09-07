export type NotifType =
  | "createShow"
  | "createMajorProduction"
  | "deleteShow"
  | "archiveShow"
  | "unarchiveShow"
  | "addSchedule"
  | "closeSchedule"
  | "openSchedule"
  | "deleteSchedule"
  | "allocateTicket"
  | "unallocateTicket"
  | "remitTicket"
  | "unremitTicket"
  | "soldTicket"
  | "unsoldTicket"
  | "addHeadRole";

export interface Notification {
  notificationId: string;
  title: string;
  message: string;
  metaData: Record<string, any> | null;
  sender: string;
  type: NotifType;
  sentAt: string;
  readAt: null | string;
}

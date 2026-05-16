export type NotificationType = "Event" | "Result" | "Placement";
export type NotificationFilter = "All" | NotificationType;

export interface CampusNotification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: CampusNotification[];
}

export interface PriorityNotification extends CampusNotification {
  rank: number;
  score: number;
  reason: string;
}

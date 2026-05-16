import { Log } from "../../../logging_middleware/logger";
import type {
  CampusNotification,
  NotificationFilter,
  NotificationsResponse,
} from "../types/notification";

interface FetchNotificationsOptions {
  page: number;
  limit: number;
  notificationType: NotificationFilter;
}

function getApiUrl(): string {
  return import.meta.env.VITE_NOTIFICATION_API_URL || "/evaluation-service/notifications";
}

function buildNotificationUrl({
  page,
  limit,
  notificationType,
}: FetchNotificationsOptions): string {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (notificationType !== "All") {
    searchParams.set("notification_type", notificationType);
  }

  return `${getApiUrl()}?${searchParams.toString()}`;
}

export async function fetchNotifications({
  page,
  limit,
  notificationType,
}: FetchNotificationsOptions): Promise<CampusNotification[]> {
  await Log("frontend", "info", "api", "Fetching campus notifications");

  try {
    const response = await fetch(buildNotificationUrl({ page, limit, notificationType }), {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN || ""}`,
      },
    });

    if (!response.ok) {
      await Log("frontend", "warn", "api", "Notification request was not successful");
      return [];
    }

    const data = (await response.json()) as NotificationsResponse;
    await Log("frontend", "info", "api", "Campus notifications fetched successfully");
    return data.notifications ?? [];
  } catch {
    await Log("frontend", "error", "api", "Notification request failed");
    return [];
  }
}

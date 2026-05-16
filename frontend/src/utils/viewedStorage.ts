import { Log } from "../../../logging_middleware/logger";

const viewedStorageKey = "campus_viewed_notification_ids";

export async function getViewedNotificationIds(): Promise<string[]> {
  await Log("frontend", "debug", "utils", "Reading viewed notification IDs");

  const savedValue = localStorage.getItem(viewedStorageKey);

  if (!savedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(savedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export async function markNotificationAsViewed(notificationId: string): Promise<string[]> {
  await Log("frontend", "info", "utils", "Marking notification as viewed");

  const viewedIds = await getViewedNotificationIds();

  if (viewedIds.includes(notificationId)) {
    return viewedIds;
  }

  const updatedIds = [...viewedIds, notificationId];
  localStorage.setItem(viewedStorageKey, JSON.stringify(updatedIds));
  return updatedIds;
}

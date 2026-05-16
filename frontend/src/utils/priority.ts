import { Log } from "../../../logging_middleware/logger";
import type { CampusNotification, PriorityNotification } from "../types/notification";

const typeWeights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getTimestampValue(timestamp: string): number {
  const normalizedTimestamp = timestamp.replace(" ", "T");
  const parsedTime = new Date(normalizedTimestamp).getTime();
  return Number.isNaN(parsedTime) ? 0 : parsedTime;
}

function getPriorityReason(notification: CampusNotification): string {
  return `${notification.Type} notification with recent timestamp`;
}

export async function calculatePriorityNotifications(
  notifications: CampusNotification[]
): Promise<PriorityNotification[]> {
  await Log("frontend", "info", "utils", "Calculating priority notifications");

  return notifications
    .map((notification) => {
      const typeWeight = typeWeights[notification.Type];
      const timestampValue = getTimestampValue(notification.Timestamp);

      return {
        ...notification,
        rank: 0,
        score: typeWeight * 10000000000000 + timestampValue,
        reason: getPriorityReason(notification),
      };
    })
    .sort((firstNotification, secondNotification) => {
      return secondNotification.score - firstNotification.score;
    })
    .slice(0, 10)
    .map((notification, index) => ({
      ...notification,
      rank: index + 1,
    }));
}

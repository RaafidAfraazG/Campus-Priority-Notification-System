import { Log } from "../../../logging_middleware/logger";
import type { CampusNotification } from "../types/notification";

interface NotificationCardProps {
  notification: CampusNotification;
  isViewed: boolean;
  onMarkViewed: (notificationId: string) => void;
}

function NotificationCard({ notification, isViewed, onMarkViewed }: NotificationCardProps) {
  async function handleCardClick() {
    await Log("frontend", "info", "component", "Notification card selected");
    onMarkViewed(notification.ID);
  }

  return (
    <article
      className={`notification-card ${notification.Type.toLowerCase()} ${
        isViewed ? "viewed" : "new"
      }`}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleCardClick();
        }
      }}
    >
      <div className="card-topline">
        <span className={`type-badge ${notification.Type.toLowerCase()}`}>
          {notification.Type}
        </span>
        <span className={isViewed ? "status viewed-status" : "status new-status"}>
          {isViewed ? "Viewed" : "New"}
        </span>
      </div>
      <p>{notification.Message}</p>
      <time>{notification.Timestamp}</time>
    </article>
  );
}

export default NotificationCard;

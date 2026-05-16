import { useEffect, useState } from "react";
import { Log } from "../../../logging_middleware/logger";
import { fetchNotifications } from "../api/notificationsApi";
import type { PriorityNotification } from "../types/notification";
import { calculatePriorityNotifications } from "../utils/priority";

function PriorityNotifications() {
  const [priorityNotifications, setPriorityNotifications] = useState<PriorityNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadPriorityNotifications() {
      await Log("frontend", "info", "page", "Priority notifications page loaded");
      setIsLoading(true);

      const notifications = await fetchNotifications({
        page: 1,
        limit: 50,
        notificationType: "All",
      });
      const rankedNotifications = await calculatePriorityNotifications(notifications);

      await Log("frontend", "info", "page", "Priority notifications calculated");
      setPriorityNotifications(rankedNotifications);
      setIsLoading(false);
    }

    loadPriorityNotifications();
  }, []);

  return (
    <main className="page-shell">
      <section className="page-heading">
        <h2>Priority Inbox</h2>
        <p>Top campus updates ranked by notification type and recency.</p>
      </section>

      {isLoading && <p className="empty-message">Loading priority notifications...</p>}

      {!isLoading && priorityNotifications.length === 0 && (
        <p className="empty-message">No priority notifications found.</p>
      )}

      <section className="priority-list" aria-label="Priority notification list">
        {priorityNotifications.map((notification) => (
          <article
            className={`priority-card ${notification.Type.toLowerCase()}`}
            key={notification.ID}
          >
            <strong className="rank">#{notification.rank}</strong>
            <div>
              <div className="card-topline">
                <span className={`type-badge ${notification.Type.toLowerCase()}`}>
                  {notification.Type}
                </span>
                <time>{notification.Timestamp}</time>
              </div>
              <p>{notification.Message}</p>
              <span className="reason">{notification.reason}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default PriorityNotifications;

import { useEffect, useState } from "react";
import { Log } from "../../../logging_middleware/logger";
import { fetchNotifications } from "../api/notificationsApi";
import NotificationCard from "../components/NotificationCard";
import NotificationFilters from "../components/NotificationFilters";
import type { CampusNotification, NotificationFilter } from "../types/notification";
import { getViewedNotificationIds, markNotificationAsViewed } from "../utils/viewedStorage";

function AllNotifications() {
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<NotificationFilter>("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadViewedIds() {
      await Log("frontend", "info", "page", "All notifications page loaded");
      setViewedIds(await getViewedNotificationIds());
    }

    loadViewedIds();
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      setIsLoading(true);
      const nextNotifications = await fetchNotifications({
        page,
        limit,
        notificationType: selectedType,
      });
      setNotifications(nextNotifications);
      setIsLoading(false);
    }

    loadNotifications();
  }, [page, limit, selectedType]);

  async function handleTypeChange(type: NotificationFilter) {
    await Log("frontend", "info", "page", "All notifications filter updated");
    setSelectedType(type);
    setPage(1);
  }

  async function handleLimitChange(nextLimit: number) {
    await Log("frontend", "info", "page", "All notifications limit updated");
    setLimit(nextLimit);
    setPage(1);
  }

  async function handlePageChange(nextPage: number) {
    await Log("frontend", "info", "page", "All notifications page number updated");
    setPage(nextPage);
  }

  async function handleMarkViewed(notificationId: string) {
    await Log("frontend", "info", "page", "All notifications viewed state updated");
    const updatedViewedIds = await markNotificationAsViewed(notificationId);
    setViewedIds(updatedViewedIds);
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <h2>All Notifications</h2>
        <p>Browse campus updates and keep track of what you have already opened.</p>
      </section>

      <NotificationFilters
        selectedType={selectedType}
        limit={limit}
        page={page}
        onTypeChange={handleTypeChange}
        onLimitChange={handleLimitChange}
        onPageChange={handlePageChange}
      />

      {isLoading && <p className="empty-message">Loading notifications...</p>}

      {!isLoading && notifications.length === 0 && (
        <p className="empty-message">No notifications found.</p>
      )}

      <section className="notification-list" aria-label="Notification list">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.ID}
            notification={notification}
            isViewed={viewedIds.includes(notification.ID)}
            onMarkViewed={handleMarkViewed}
          />
        ))}
      </section>
    </main>
  );
}

export default AllNotifications;

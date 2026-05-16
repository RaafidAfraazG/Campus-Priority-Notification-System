import { Log } from "../../../logging_middleware/logger";
import type { NotificationFilter } from "../types/notification";

interface NotificationFiltersProps {
  selectedType: NotificationFilter;
  limit: number;
  page: number;
  onTypeChange: (type: NotificationFilter) => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}

const notificationTypes: NotificationFilter[] = ["All", "Event", "Result", "Placement"];
const pageLimits = [5, 10, 15, 20];

function NotificationFilters({
  selectedType,
  limit,
  page,
  onTypeChange,
  onLimitChange,
  onPageChange,
}: NotificationFiltersProps) {
  async function handleTypeChange(type: NotificationFilter) {
    await Log("frontend", "info", "component", "Notification filter changed");
    onTypeChange(type);
  }

  async function handleLimitChange(nextLimit: number) {
    await Log("frontend", "info", "component", "Notification limit changed");
    onLimitChange(nextLimit);
  }

  async function handlePageChange(nextPage: number) {
    await Log("frontend", "info", "component", "Notification page changed");
    onPageChange(nextPage);
  }

  return (
    <section className="filters-panel" aria-label="Notification filters">
      <div className="filter-group">
        <span>Type</span>
        <div className="button-row">
          {notificationTypes.map((type) => (
            <button
              className={selectedType === type ? "active" : ""}
              key={type}
              onClick={() => handleTypeChange(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span>Limit</span>
        <select
          aria-label="Notifications per page"
          value={limit}
          onChange={(event) => handleLimitChange(Number(event.target.value))}
        >
          {pageLimits.map((pageLimit) => (
            <option value={pageLimit} key={pageLimit}>
              {pageLimit}
            </option>
          ))}
        </select>
      </div>

      <div className="pagination-controls">
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} type="button">
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => handlePageChange(page + 1)} type="button">
          Next
        </button>
      </div>
    </section>
  );
}

export default NotificationFilters;

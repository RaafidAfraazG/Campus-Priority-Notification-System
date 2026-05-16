import { Log } from "../../../logging_middleware/logger";

interface HeaderProps {
  currentPage: "all" | "priority";
  onPageChange: (page: "all" | "priority") => void;
}

function Header({ currentPage, onPageChange }: HeaderProps) {
  async function handlePageChange(page: "all" | "priority") {
    await Log("frontend", "info", "component", "Header navigation changed");
    onPageChange(page);
  }

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Campus Notification System</p>
        <h1>Student Notification Center</h1>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        <button
          className={currentPage === "all" ? "active" : ""}
          onClick={() => handlePageChange("all")}
          type="button"
        >
          All Notifications
        </button>
        <button
          className={currentPage === "priority" ? "active" : ""}
          onClick={() => handlePageChange("priority")}
          type="button"
        >
          Priority Inbox
        </button>
      </nav>
    </header>
  );
}

export default Header;

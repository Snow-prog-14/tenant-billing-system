import type { Page } from "../types/billing";

type SidebarProps = {
  activePage: Page;
  onChangePage: (page: Page) => void;
};

function Sidebar({ activePage, onChangePage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">TB</div>

        <div>
          <h2>TenantBill</h2>
          <p>Billing Manager</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => onChangePage("dashboard")}
        >
          <span className="nav-icon">▦</span>
          <span>Dashboard</span>
        </button>

        <button
          className={activePage === "tenants" ? "active" : ""}
          onClick={() => onChangePage("tenants")}
        >
          <span className="nav-icon">◎</span>
          <span>Tenants</span>
        </button>

        <button
          className={activePage === "utility" ? "active" : ""}
          onClick={() => onChangePage("utility")}
        >
          <span className="nav-icon">⚡</span>
          <span>Utility Bills</span>
        </button>

        <button
          className={activePage === "rent" ? "active" : ""}
          onClick={() => onChangePage("rent")}
        >
          <span className="nav-icon">⌂</span>
          <span>Rent Bills</span>
        </button>

        <button
        className={activePage === "settings" ? "active" : ""}
        onClick={() => onChangePage("settings")}
      >
        <span className="nav-icon">⚙</span>
        <span>Settings</span>
      </button>
      </nav>

      <div className="sidebar-footer">
        <span>Current Mode</span>
        <strong>Local Preview</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
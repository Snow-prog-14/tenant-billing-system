import type { Page } from "../types/billing";

type SidebarProps = {
  activePage: Page;
  onChangePage: (page: Page) => void;
};

function Sidebar({ activePage, onChangePage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Billing</h2>
        <p>Tenant System</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => onChangePage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={activePage === "tenants" ? "active" : ""}
          onClick={() => onChangePage("tenants")}
        >
          Tenants
        </button>

        <button
          className={activePage === "utility" ? "active" : ""}
          onClick={() => onChangePage("utility")}
        >
          Utility Bills
        </button>

        <button
          className={activePage === "rent" ? "active" : ""}
          onClick={() => onChangePage("rent")}
        >
          Rent Bills
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
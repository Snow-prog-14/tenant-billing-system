import type { AppMode, Page } from "../types/billing";

type SidebarProps = {
  activePage: Page;
  onChangePage: (page: Page) => void;
  mode: AppMode;
  onLogout: () => void;
  onLogoClick?: () => void;
};

function Sidebar({ activePage, onChangePage, mode, onLogout, onLogoClick }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={onLogoClick} style={{ cursor: "pointer" }}>
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
        <div className="mode-status">
          <span>Current Mode</span>
          <strong className={mode === "personal" ? "mode-personal" : "mode-demo"}>
            {mode === "personal" ? "Personal Mode" : "Demo Mode"}
          </strong>
        </div>
        
        {mode === "personal" && (
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
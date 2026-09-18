import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search bookings, rooms..."
            aria-label="Search"
          />

          <span className="search-shortcut">
            Ctrl K
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
          onClick={() =>
            window.alert(
              "Notifications will appear here."
            )
          }
        >
          <Bell size={19} />

          <span className="notification-dot" />
        </button>

        <div className="topbar-divider" />

        <button
          type="button"
          className="topbar-profile"
        >
          <div className="topbar-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "G"}
          </div>

          <div className="topbar-user-info">
            <strong>
              {user?.name || "Guest"}
            </strong>

            <span>
              {user?.role === "admin"
                ? "Administrator"
                : user?.role === "receptionist"
                ? "Receptionist"
                : "Guest"}
            </span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
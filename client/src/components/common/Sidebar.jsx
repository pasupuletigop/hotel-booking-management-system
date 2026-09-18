import { NavLink, useNavigate } from "react-router-dom";

import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ConciergeBell,
  DoorOpen,
  Heart,
  HelpCircle,
  Hotel,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  X,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const role = user?.role || "customer";

  const customerNavigation = [
    {
      label: "Dashboard",
      path: "/customer",
      icon: LayoutDashboard,
    },
    {
      label: "Find a Room",
      path: "/rooms/search",
      icon: Search,
    },
    {
      label: "My Bookings",
      path: "/customer/bookings",
      icon: CalendarDays,
    },
    {
      label: "Favorites",
      path: "#",
      icon: Heart,
      disabled: true,
    },
  ];

  const receptionistNavigation = [
    {
      label: "Dashboard",
      path: "/receptionist",
      icon: LayoutDashboard,
    },
    {
      label: "Today's Bookings",
      path: "#",
      icon: CalendarDays,
      disabled: true,
    },
    {
      label: "Check-ins",
      path: "#",
      icon: DoorOpen,
      disabled: true,
    },
    {
      label: "Check-outs",
      path: "#",
      icon: DoorOpen,
      disabled: true,
    },
    {
      label: "Room Status",
      path: "#",
      icon: BedDouble,
      disabled: true,
    },
    {
      label: "Guests",
      path: "#",
      icon: Users,
      disabled: true,
    },
  ];

  const adminNavigation = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Hotel",
      path: "#",
      icon: Hotel,
      disabled: true,
    },
    {
      label: "Rooms",
      path: "#",
      icon: BedDouble,
      disabled: true,
    },
    {
      label: "Bookings",
      path: "#",
      icon: CalendarDays,
      disabled: true,
    },
    {
  label: "Users",
  path: "/admin/users",
  icon: Users,
},
    {
      label: "Analytics",
      path: "#",
      icon: BarChart3,
      disabled: true,
    },
  ];

  let navigation = customerNavigation;

  if (role === "admin") {
    navigation = adminNavigation;
  }

  if (role === "receptionist") {
    navigation = receptionistNavigation;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
      onClose?.();
    }
  };

  const handleConciergeClick = () => {
    navigate("/ai-concierge");
    onClose?.();
  };

  const handleBrandClick = () => {
    navigate(
      role === "admin"
        ? "/admin"
        : role === "receptionist"
        ? "/receptionist"
        : "/customer"
    );

    onClose?.();
  };

  return (
    <aside
      className={`app-sidebar ${
        isOpen ? "app-sidebar-open" : ""
      }`}
    >
      {/* =====================================================
          SIDEBAR HEADER
          ===================================================== */}

      <div className="sidebar-header">
        <div
          className="sidebar-brand"
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleBrandClick();
            }
          }}
        >
          <div className="sidebar-brand-icon">
            GP
          </div>

          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">
              Grand Palace
            </span>

            <span className="sidebar-brand-subtitle">
              HOTEL & RESORT
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={21} />
        </button>
      </div>

      {/* =====================================================
          USER PROFILE
          ===================================================== */}

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "G"}
        </div>

        <div className="sidebar-user-info">
          <strong>
            {user?.name || "Guest"}
          </strong>

          <span>
            {role === "admin"
              ? "Administrator"
              : role === "receptionist"
              ? "Receptionist"
              : "Guest"}
          </span>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <nav className="sidebar-navigation">
        <span className="sidebar-section-title">
          MAIN MENU
        </span>

        <div className="sidebar-nav-list">
          {navigation.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="sidebar-nav-item sidebar-nav-disabled"
                  disabled
                  title={`${item.label} will be available soon`}
                >
                  <Icon size={19} />

                  <span>{item.label}</span>

                  <small>Soon</small>
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === "/customer"}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-active"
                      : ""
                  }`
                }
                onClick={onClose}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* ===================================================
            AI CONCIERGE
            =================================================== */}

        <span className="sidebar-section-title sidebar-section-ai">
          CONCIERGE
        </span>

        <button
          type="button"
          className="sidebar-ai-card"
          onClick={handleConciergeClick}
        >
          <div className="sidebar-ai-icon">
            <ConciergeBell size={19} />
          </div>

          <div>
            <strong>AI Concierge</strong>

            <span>
              Ask anything about your stay
            </span>
          </div>
        </button>
      </nav>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="sidebar-footer">
        <NavLink
          to="#"
          className="sidebar-footer-link"
          onClick={(event) =>
            event.preventDefault()
          }
        >
          <Settings size={18} />

          <span>Settings</span>
        </NavLink>

        <NavLink
          to="#"
          className="sidebar-footer-link"
          onClick={(event) =>
            event.preventDefault()
          }
        >
          <HelpCircle size={18} />

          <span>Help & Support</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          <span>Sign out</span>
        </button>

        <div className="sidebar-security">
          <ShieldCheck size={15} />

          <span>
            Secure hotel management
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
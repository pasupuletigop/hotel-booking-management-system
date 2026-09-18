import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Hotel,
  Home,
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "receptionist") return "/receptionist";
    return "/customer";
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to={user ? getDashboardPath() : "/login"}
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <div className="brand-icon">
            <Hotel size={24} strokeWidth={2.2} />
          </div>

          <div className="brand-text">
            <span className="brand-name">Grand Palace</span>
            <span className="brand-subtitle">Hotel & Resort</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links">

          {!user && (
            <>
              <Link to="/login" className="navbar-link">
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link to="/rooms/search" className="navbar-link">
                <BedDouble size={18} />
                <span>Rooms</span>
              </Link>
            </>
          )}

          {user?.role === "customer" && (
            <>
              <Link to="/customer" className="navbar-link">
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link to="/rooms/search" className="navbar-link">
                <BedDouble size={18} />
                <span>Rooms</span>
              </Link>

              <Link to="/customer/bookings" className="navbar-link">
                <CalendarDays size={18} />
                <span>My Bookings</span>
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/admin" className="navbar-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              <Link to="/rooms/search" className="navbar-link">
                <BedDouble size={18} />
                <span>Rooms</span>
              </Link>
            </>
          )}

          {user?.role === "receptionist" && (
            <>
              <Link to="/receptionist" className="navbar-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              <Link to="/rooms/search" className="navbar-link">
                <BedDouble size={18} />
                <span>Rooms</span>
              </Link>
            </>
          )}

        </nav>

        {/* Desktop User Section */}
        <div className="navbar-user">

          {user ? (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  <User size={18} />
                </div>

                <div className="user-details">
                  <span className="user-name">
                    {user.name}
                  </span>

                  <span className="user-role">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                className="logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-login-button">
              Login
            </Link>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-navigation">

          {!user && (
            <>
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <Home size={18} />
                Home
              </Link>

              <Link
                to="/rooms/search"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <BedDouble size={18} />
                Rooms
              </Link>
            </>
          )}

          {user?.role === "customer" && (
            <>
              <Link
                to="/customer"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <Home size={18} />
                Home
              </Link>

              <Link
                to="/rooms/search"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <BedDouble size={18} />
                Rooms
              </Link>

              <Link
                to="/customer/bookings"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                <CalendarDays size={18} />
                My Bookings
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}

          {user?.role === "receptionist" && (
            <Link
              to="/receptionist"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          )}

          {user && (
            <button
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          )}

        </div>
      )}
    </header>
  );
};

export default Navbar;
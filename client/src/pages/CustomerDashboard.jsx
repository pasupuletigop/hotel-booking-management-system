import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const CustomerDashboard = () => {
  const { user } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Guest";

  return (
    <div className="customer-dashboard">
      {/* Hero */}
      <section className="customer-welcome">
        <div className="customer-welcome-content">
          <span className="customer-eyebrow">
            GRAND PALACE GUEST PORTAL
          </span>

          <h1>
            Good morning,{" "}
            <em>{firstName}</em>
          </h1>

          <p>
            Welcome back. Your next memorable stay
            is just a few clicks away.
          </p>

          <Link
            to="/rooms/search"
            className="customer-hero-button"
          >
            <Search size={18} />
            <span>Find your perfect room</span>
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="customer-welcome-decoration">
          <Sparkles size={24} />
        </div>
      </section>

      {/* Quick stats */}
      <section className="customer-stat-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <BedDouble size={20} />
          </div>

          <div>
            <span className="customer-stat-label">
              Total stays
            </span>

            <strong>04</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <CalendarCheck size={20} />
          </div>

          <div>
            <span className="customer-stat-label">
              Upcoming
            </span>

            <strong>01</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span className="customer-stat-label">
              Nights stayed
            </span>

            <strong>12</strong>
          </div>
        </div>
      </section>

      {/* Upcoming reservation */}
      <section className="customer-section">
        <div className="customer-section-header">
          <div>
            <span className="section-eyebrow">
              YOUR RESERVATION
            </span>

            <h2>Upcoming stay</h2>
          </div>

          <Link
            to="/customer/bookings"
            className="section-link"
          >
            View all bookings
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="upcoming-booking-card">
          <div className="upcoming-booking-image">
            <img
              src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=85"
              alt="Grand Palace hotel room"
            />

            <span className="booking-confirmed-badge">
              <span />
              Confirmed
            </span>
          </div>

          <div className="upcoming-booking-content">
            <div className="upcoming-booking-top">
              <div>
                <span className="booking-property-label">
                  GRAND PALACE HOTEL & RESORT
                </span>

                <h3>Deluxe King Room</h3>

                <div className="booking-location">
                  <MapPin size={14} />
                  <span>
                    Grand Palace Hotel
                  </span>
                </div>
              </div>

              <div className="booking-id">
                <span>BOOKING ID</span>
                <strong>GP-2026-10482</strong>
              </div>
            </div>

            <div className="booking-details-row">
              <div>
                <span>CHECK-IN</span>
                <strong>20 Sep 2026</strong>
              </div>

              <div>
                <span>CHECK-OUT</span>
                <strong>23 Sep 2026</strong>
              </div>

              <div>
                <span>GUESTS</span>
                <strong>2 Guests</strong>
              </div>

              <div>
                <span>STAY</span>
                <strong>3 Nights</strong>
              </div>
            </div>

            <div className="booking-card-footer">
              <div className="booking-price">
                <span>Total amount</span>
                <strong>₹15,930</strong>
              </div>

              <Link
                to="/customer/bookings"
                className="booking-view-button"
              >
                View reservation
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="customer-section">
        <div className="customer-section-header">
          <div>
            <span className="section-eyebrow">
              QUICK ACCESS
            </span>

            <h2>Make yourself at home</h2>
          </div>
        </div>

        <div className="customer-action-grid">
          <Link
            to="/rooms/search"
            className="customer-action-card"
          >
            <div className="customer-action-icon">
              <Search size={21} />
            </div>

            <div>
              <h3>Explore rooms</h3>

              <p>
                Find a room that matches your
                perfect stay.
              </p>
            </div>

            <ArrowRight size={17} />
          </Link>

          <Link
            to="/customer/bookings"
            className="customer-action-card"
          >
            <div className="customer-action-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <h3>My reservations</h3>

              <p>
                Manage your upcoming and past
                stays.
              </p>
            </div>

            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            className="customer-action-card"
            onClick={() =>
              window.alert(
                "Grand Palace AI Concierge will be connected in the RAG phase."
              )
            }
          >
            <div className="customer-action-icon gold">
              <Sparkles size={21} />
            </div>

            <div>
              <h3>AI Concierge</h3>

              <p>
                Get instant assistance with your
                hotel stay.
              </p>
            </div>

            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Trust strip */}
      <section className="customer-trust-strip">
        <div className="customer-trust-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <strong>
            Your stay is in safe hands
          </strong>

          <p>
            Secure reservations, protected account
            information and 24/7 guest support.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;
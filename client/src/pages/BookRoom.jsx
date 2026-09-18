import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import BookingForm from "../components/bookings/BookingForm";

const BookRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    room,
    checkIn,
    checkOut,
    guests,
  } = location.state || {};

  if (!room) {
    return <Navigate to="/rooms/search" replace />;
  }

  return (
    <div className="book-room-page">
      <section className="booking-page-header">
        <div className="booking-page-header-container">

          <button
            type="button"
            className="back-to-rooms"
            onClick={() => navigate("/rooms/search")}
          >
            <ArrowLeft size={17} />
            Back to Rooms
          </button>

          <div className="booking-page-title">
            <span>RESERVATION</span>

            <h1>Reserve Your Stay</h1>

            <p>
              A comfortable stay at Grand Palace is just a few
              steps away.
            </p>
          </div>

          <div className="booking-header-trust">

            <div>
              <ShieldCheck size={18} />
              <span>Secure Booking</span>
            </div>

            <div>
              <Headphones size={18} />
              <span>Guest Support</span>
            </div>

          </div>
        </div>
      </section>

      <main className="booking-main">
        <BookingForm
          room={room}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialGuests={guests}
        />
      </main>
    </div>
  );
};

export default BookRoom;
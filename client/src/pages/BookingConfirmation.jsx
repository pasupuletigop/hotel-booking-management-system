import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  CalendarDays,
  Users,
  BedDouble,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
} from "lucide-react";

import { getBookingById } from "../services/bookingService";

const BookingConfirmation = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getBookingById(id);

        const bookingData =
          response?.booking ||
          response?.data?.booking ||
          response?.data ||
          response;

        setBooking(bookingData);
      } catch (err) {
        console.error("Failed to load booking:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load your booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBooking();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) {
      return 0;
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    const difference =
      checkOut.getTime() - checkIn.getTime();

    return Math.max(
      0,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  };

  if (loading) {
    return (
      <div className="booking-result-page">
        <div className="booking-result-state">
          <div className="booking-loading-spinner" />

          <h2>Loading Reservation</h2>

          <p>
            Please wait while we retrieve your booking
            details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-result-page">
        <div className="booking-result-state booking-error-state">
          <div className="booking-error-icon">
            !
          </div>

          <h2>Booking Not Found</h2>

          <p>
            {error ||
              "We couldn't find the requested reservation."}
          </p>

          <div className="booking-result-actions">
            <Link
              to="/customer/bookings"
              className="primary-button"
            >
              View My Bookings
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/dashboard"
              className="secondary-button"
            >
              <Home size={17} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const room = booking.room || {};
  const hotel = room.hotel || booking.hotel || {};
  const nights = calculateNights();

  const pricePerNight =
    Number(room.pricePerNight) ||
    Number(room.price) ||
    0;

  const totalAmount =
    Number(booking.totalAmount) ||
    Number(booking.totalPrice) ||
    Number(booking.amount) ||
    pricePerNight * nights;

  return (
    <div className="booking-confirmation-page">
      <div className="confirmation-container">

        {/* Success Header */}
        <section className="confirmation-success-section">
          <div className="confirmation-success-icon">
            <CheckCircle2 size={48} strokeWidth={1.8} />
          </div>

          <span className="confirmation-eyebrow">
            RESERVATION CONFIRMED
          </span>

          <h1>Your Stay Is Confirmed</h1>

          <p>
            Thank you for choosing Grand Palace.
            Your reservation has been successfully created.
          </p>

          <div className="confirmation-reference">
            <span>Booking ID</span>
            <strong>{booking._id}</strong>
          </div>
        </section>

        {/* Booking Card */}
        <section className="confirmation-card">

          {/* Room Information */}
          <div className="confirmation-room-section">
            <div className="confirmation-room-icon">
              <BedDouble size={25} />
            </div>

            <div className="confirmation-room-info">
              <span className="confirmation-label">
                YOUR ROOM
              </span>

              <h2>
                {room.roomType ||
                  room.type ||
                  "Reserved Room"}
              </h2>

              {room.roomNumber && (
                <p>
                  Room {room.roomNumber}
                </p>
              )}

              {hotel.name && (
                <div className="confirmation-location">
                  <MapPin size={15} />
                  <span>
                    {hotel.name}
                    {hotel.city
                      ? `, ${hotel.city}`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="confirmation-status">
              <span
                className={`confirmation-status-badge ${
                  booking.status || "confirmed"
                }`}
              >
                {booking.status || "confirmed"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="confirmation-divider" />

          {/* Reservation Details */}
          <div className="confirmation-details-grid">

            <div className="confirmation-detail-item">
              <div className="confirmation-detail-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>CHECK-IN</span>
                <strong>
                  {formatDate(booking.checkIn)}
                </strong>
              </div>
            </div>

            <div className="confirmation-detail-item">
              <div className="confirmation-detail-icon">
                <CalendarDays size={19} />
              </div>

              <div>
                <span>CHECK-OUT</span>
                <strong>
                  {formatDate(booking.checkOut)}
                </strong>
              </div>
            </div>

            <div className="confirmation-detail-item">
              <div className="confirmation-detail-icon">
                <Users size={19} />
              </div>

              <div>
                <span>GUESTS</span>
                <strong>
                  {booking.guests || 1}
                  {Number(booking.guests) === 1
                    ? " Guest"
                    : " Guests"}
                </strong>
              </div>
            </div>

            <div className="confirmation-detail-item">
              <div className="confirmation-detail-icon">
                <BedDouble size={19} />
              </div>

              <div>
                <span>STAY</span>
                <strong>
                  {nights}{" "}
                  {nights === 1 ? "Night" : "Nights"}
                </strong>
              </div>
            </div>

          </div>

          {/* Price */}
          <div className="confirmation-price-section">
            <div className="confirmation-price-label">
              <CreditCard size={18} />

              <div>
                <span>Total Reservation Amount</span>

                {pricePerNight > 0 && nights > 0 && (
                  <small>
                    ₹{pricePerNight.toLocaleString("en-IN")}
                    {" × "}
                    {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </small>
                )}
              </div>
            </div>

            <strong>
              ₹{totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>

        </section>

        {/* Actions */}
        <section className="confirmation-actions-section">

          <Link
            to="/customer/bookings"
            className="primary-button confirmation-primary-action"
          >
            View My Bookings
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/dashboard"
            className="secondary-button"
          >
            <Home size={17} />
            Back to Dashboard
          </Link>

        </section>

        {/* Trust Message */}
        <div className="confirmation-trust-message">
          <CheckCircle2 size={16} />

          <span>
            Your reservation details have been securely
            saved. Please keep your booking ID for
            future reference.
          </span>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
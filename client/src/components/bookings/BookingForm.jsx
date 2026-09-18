import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  BedDouble,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { createBooking } from "../../services/bookingService";

const BookingForm = ({
  room,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 1,
}) => {
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(initialCheckIn);
const [checkOut, setCheckOut] = useState(initialCheckOut);
const [guests, setGuests] = useState(
  Number(initialGuests) || 1
);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const pricePerNight = Number(room?.pricePerNight || 0);

  const capacity = Number(room?.capacity || 1);

  const roomType = room?.roomType || room?.type || "double";

  const formattedRoomType =
    String(roomType).charAt(0).toUpperCase() +
    String(roomType).slice(1);

  const calculateNights = () => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  const nights = calculateNights();

  const totalAmount = nights * pricePerNight;

  const handleDateChange = (setter, value) => {
    setter(value);
    setError("");
  };

  const handleGuestsChange = (event) => {
    setGuests(Number(event.target.value));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!checkIn || !checkOut) {
      setError(
        "Please select both your check-in and check-out dates."
      );
      return;
    }

    if (checkIn < today) {
      setError(
        "Check-in date cannot be in the past."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (guests < 1 || guests > capacity) {
      setError(
        `This room can accommodate a maximum of ${capacity} guests.`
      );
      return;
    }

    if (nights <= 0) {
      setError(
        "Please select valid booking dates."
      );
      return;
    }

    if (!room?._id) {
      setError(
        "Room information is missing. Please return to the room search."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await createBooking({
        room: room._id,
        checkIn,
        checkOut,
        guests,
      });

      const bookingId =
        response?.booking?._id ||
        response?.data?._id ||
        response?.data?.booking?._id ||
        response?._id;

      if (!bookingId) {
        throw new Error(
          "Booking was created but the booking ID was not returned."
        );
      }

      navigate(
        `/booking-confirmation/${bookingId}`,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create your booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const value = String(amenity).toLowerCase();

    if (value.includes("wifi")) {
      return <Wifi size={15} />;
    }

    if (
      value.includes("parking") ||
      value.includes("car")
    ) {
      return <Car size={15} />;
    }

    if (
      value.includes("restaurant") ||
      value.includes("food") ||
      value.includes("dining")
    ) {
      return <Utensils size={15} />;
    }

    if (
      value.includes("gym") ||
      value.includes("fitness")
    ) {
      return <Dumbbell size={15} />;
    }

    return <CheckCircle2 size={15} />;
  };

  return (
    <div className="booking-layout">

      {/* =================================================
          LEFT — ROOM INFORMATION
      ================================================= */}

      <section className="booking-room-panel">

        <div className="booking-room-image">
          <img
            src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85"
            alt={`${formattedRoomType} room`}
          />

          <div className="booking-room-image-overlay" />

          <div className="booking-room-image-content">
            <span className="booking-room-badge">
              <Sparkles size={13} />
              Premium Stay
            </span>

            <span className="booking-room-image-caption">
              GRAND PALACE HOTEL & RESORT
            </span>
          </div>
        </div>

        <div className="booking-room-content">

          <div className="booking-room-heading">
            <div>
              <span className="booking-eyebrow">
                GRAND PALACE HOTEL
              </span>

              <h2>
                {formattedRoomType} Room
              </h2>

              {room?.roomNumber && (
                <p>
                  Room {room.roomNumber}
                </p>
              )}
            </div>

            <div className="booking-room-price">
              <strong>
                ₹{pricePerNight.toLocaleString("en-IN")}
              </strong>

              <span>/ night</span>
            </div>
          </div>

          {room?.description && (
            <p className="booking-room-description">
              {room.description}
            </p>
          )}

          <div className="booking-room-features">

            <div>
              <Users size={18} />

              <div>
                <strong>Guest Capacity</strong>
                <span>
                  Up to {capacity}{" "}
                  {capacity === 1 ? "guest" : "guests"}
                </span>
              </div>
            </div>

            <div>
              <BedDouble size={18} />

              <div>
                <strong>Room Type</strong>
                <span>
                  {formattedRoomType} accommodation
                </span>
              </div>
            </div>

          </div>

          {Array.isArray(room?.amenities) &&
            room.amenities.length > 0 && (
              <div className="booking-amenities">
                <h3>Room Amenities</h3>

                <div className="booking-amenity-grid">
                  {room.amenities.map(
                    (amenity, index) => (
                      <div
                        className="booking-amenity"
                        key={`${amenity}-${index}`}
                      >
                        {getAmenityIcon(amenity)}

                        <span>{amenity}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          <div className="booking-trust">
            <div className="booking-trust-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>Secure Reservation</strong>

              <p>
                Your booking information is securely
                processed and protected.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* =================================================
          RIGHT — BOOKING FORM
      ================================================= */}

      <section className="booking-form-panel">

        <div className="booking-form-heading">

          <span className="booking-eyebrow">
            RESERVATION DETAILS
          </span>

          <h1>
            Complete Your Booking
          </h1>

          <p>
            Select your dates and number of guests
            to reserve this room.
          </p>

        </div>

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* DATE GRID */}

          <div className="booking-date-grid">

            <div className="booking-form-field">

              <label htmlFor="booking-checkin">
                <CalendarDays size={16} />
                Check-in
              </label>

              <input
                id="booking-checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={(event) =>
                  handleDateChange(
                    setCheckIn,
                    event.target.value
                  )
                }
              />

              <span className="booking-field-hint">
                From 2:00 PM
              </span>

            </div>


            <div className="booking-form-field">

              <label htmlFor="booking-checkout">
                <CalendarDays size={16} />
                Check-out
              </label>

              <input
                id="booking-checkout"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(event) =>
                  handleDateChange(
                    setCheckOut,
                    event.target.value
                  )
                }
              />

              <span className="booking-field-hint">
                Until 11:00 AM
              </span>

            </div>

          </div>


          {/* GUESTS */}

          <div className="booking-form-field">

            <label htmlFor="booking-guests">
              <Users size={16} />
              Number of Guests
            </label>

            <select
              id="booking-guests"
              value={guests}
              onChange={handleGuestsChange}
            >
              {Array.from(
                { length: capacity },
                (_, index) => index + 1
              ).map((number) => (
                <option
                  key={number}
                  value={number}
                >
                  {number}{" "}
                  {number === 1
                    ? "Guest"
                    : "Guests"}
                </option>
              ))}
            </select>

            <span className="booking-field-hint">
              Maximum {capacity}{" "}
              {capacity === 1 ? "guest" : "guests"}
            </span>

          </div>


          {/* ERROR */}

          {error && (
            <div className="booking-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}


          {/* SUMMARY */}

          <div className="booking-summary">

            <div className="booking-summary-heading">
              <div>
                <span className="booking-summary-label">
                  YOUR STAY
                </span>

                <h3>
                  Booking Summary
                </h3>
              </div>

              <span className="booking-summary-nights">
                {nights > 0
                  ? `${nights} ${
                      nights === 1
                        ? "night"
                        : "nights"
                    }`
                  : "Select dates"}
              </span>
            </div>

            {nights > 0 && (
              <div className="booking-summary-dates">
                <div>
                  <span>Check-in</span>
                  <strong>{checkIn}</strong>
                </div>

                <div className="booking-summary-arrow">
                  →
                </div>

                <div>
                  <span>Check-out</span>
                  <strong>{checkOut}</strong>
                </div>
              </div>
            )}

            <div className="booking-summary-row">
              <span>
                ₹{pricePerNight.toLocaleString("en-IN")}
                {" "}×{" "}
                {nights || 0}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>

              <strong>
                ₹{totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="booking-summary-divider" />

            <div className="booking-total">
              <div>
                <span>Total Amount</span>

                <small>
                  Inclusive of room charges
                </small>
              </div>

              <strong>
                ₹{totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          {/* CONFIRM */}

          <button
            type="submit"
            className="confirm-booking-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={19}
                  className="spin"
                />

                Processing Reservation...
              </>
            ) : (
              <>
                Confirm Booking

                <ArrowRight size={19} />
              </>
            )}
          </button>


          <div className="booking-secure-note">
            <ShieldCheck size={15} />

            <span>
              Secure booking • No hidden charges
            </span>
          </div>

        </form>

      </section>
    </div>
  );
};

export default BookingForm;
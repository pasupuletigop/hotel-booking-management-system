import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  BedDouble,
  MapPin,
  ArrowRight,
  XCircle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import {
  getMyBookings,
  cancelBooking,
  requestBookingCancellation,
} from "../services/bookingService";

import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancellingId, setCancellingId] =
    useState(null);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  // =====================================================
  // LOAD CUSTOMER BOOKINGS
  // =====================================================

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyBookings();

      const bookingData =
        response?.bookings ||
        response?.data?.bookings ||
        response?.data ||
        [];

      setBookings(
        Array.isArray(bookingData)
          ? bookingData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load bookings:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadBookings();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // CALCULATE NIGHTS
  // =====================================================

  const calculateNights = (
    checkIn,
    checkOut
  ) => {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
      end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  // =====================================================
  // NORMALIZE BOOKING STATUS
  // =====================================================

  const getBookingStatus = (status) => {
    if (!status) {
      return "pending";
    }

    return status.toLowerCase();
  };

  // =====================================================
  // CHECK WHETHER BOOKING CAN BE CANCELLED
  // =====================================================

  const canManageCancellation = (booking) => {
  const status = getBookingStatus(
    booking.status
  );

  return (
    status !== "cancelled" &&
    status !== "canceled" &&
    status !== "completed"
  );
};
const getCancellationDeadline = (checkIn) => {
  if (!checkIn) {
    return null;
  }

  return new Date(
    new Date(checkIn).getTime() -
      24 * 60 * 60 * 1000
  );
};

const isDirectCancellationAllowed = (booking) => {
  if (!booking || !booking.checkIn) {
    return false;
  }

  const deadline = getCancellationDeadline(booking.checkIn);

  return new Date() <= deadline;
};

const hasPendingCancellationRequest = (
  booking
) => {
  return (
    booking?.cancellationRequestStatus ===
    "pending"
  );
};

  // =====================================================
  // OPEN CANCEL CONFIRMATION
  // =====================================================

  const handleCancelClick = (booking) => {
  setSelectedBooking(booking);
};
const handleRequestCancellation = async () => {
  if (!selectedBooking?._id) {
    return;
  }

  const reason = window.prompt(
    "Please enter the reason for cancellation:"
  );

  if (!reason?.trim()) {
    return;
  }

  try {
    setCancellingId(
      selectedBooking._id
    );

    setError("");

    const response =
      await requestBookingCancellation(
        selectedBooking._id,
        reason.trim()
      );

    const updatedBooking =
      response?.booking;

    setBookings(
      (currentBookings) =>
        currentBookings.map(
          (booking) =>
            booking._id ===
            selectedBooking._id
              ? {
                  ...booking,
                  ...(updatedBooking ||
                    {}),
                  cancellationRequestStatus:
                    "pending",
                  cancellationReason:
                    reason.trim(),
                }
              : booking
        )
    );

    setSelectedBooking(null);
  } catch (err) {
    console.error(
      "Failed to request cancellation:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Unable to submit cancellation request."
    );
  } finally {
    setCancellingId(null);
  }
};
  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const handleCancelBooking = async () => {
    if (!selectedBooking?._id) {
      console.error(
        "No booking selected for cancellation."
      );

      return;
    }

    try {
      setCancellingId(
        selectedBooking._id
      );

      setError("");

      console.log(
        "Cancelling booking:",
        selectedBooking._id
      );

      const response =
        await cancelBooking(
          selectedBooking._id
        );

      console.log(
        "Cancellation response:",
        response
      );

      // -------------------------------------------------
      // Update booking status in UI immediately
      // -------------------------------------------------

      setBookings(
        (currentBookings) =>
          currentBookings.map(
            (booking) =>
              booking._id ===
              selectedBooking._id
                ? {
                    ...booking,
                    status: "cancelled",
                  }
                : booking
          )
      );

      // -------------------------------------------------
      // Close confirmation dialog
      // -------------------------------------------------

      setSelectedBooking(null);
    } catch (err) {
  console.error(
    "Failed to cancel booking:",
    err
  );

  console.error(
    "Status:",
    err?.response?.status
  );

  console.error(
    "Server response:",
    JSON.stringify(
      err?.response?.data,
      null,
      2
    )
  );

  setError(
    err?.response?.data?.message ||
      "Unable to cancel this booking."
  );
} finally {
  setCancellingId(null);
}
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader
          eyebrow="RESERVATIONS"
          title="My Bookings"
          description="View and manage your hotel reservations."
        />

        <LoadingState message="Loading your bookings..." />
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container my-bookings-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        eyebrow="RESERVATIONS"
        title="My Bookings"
        description="View and manage your hotel reservations."
      />

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="my-bookings-toolbar">

        <div className="my-bookings-summary">

          <div className="my-bookings-summary-icon">
            <ClipboardList size={20} />
          </div>

          <div>
            <strong>
              {bookings.length}
            </strong>

            <span>
              {bookings.length === 1
                ? "Reservation"
                : "Reservations"}
            </span>
          </div>

        </div>

        <button
          type="button"
          className="refresh-bookings-button"
          onClick={loadBookings}
          disabled={loading}
        >
          <RefreshCw size={16} />

          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="bookings-error-message">

          <XCircle size={18} />

          <span>{error}</span>

        </div>
      )}

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!error &&
        bookings.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="No bookings yet"
            message="You don't have any hotel reservations yet. Find a room and start planning your stay."
            action={
              <Link
                to="/rooms/search"
                className="primary-button"
              >
                Find a Room

                <ArrowRight size={17} />
              </Link>
            }
          />
        )}

      {/* =================================================
          BOOKINGS LIST
      ================================================= */}

      {bookings.length > 0 && (
        <div className="bookings-list">

          {bookings.map((booking) => {
            const room =
              booking.room || {};

            const hotel =
              room.hotel ||
              booking.hotel ||
              {};

            const status =
              getBookingStatus(
                booking.status
              );

            const nights =
              calculateNights(
                booking.checkIn,
                booking.checkOut
              );

            const pricePerNight =
              Number(
                room.pricePerNight
              ) ||
              Number(room.price) ||
              Number(
                booking.pricePerNight
              ) ||
              0;

            const totalAmount =
              Number(
                booking.totalAmount
              ) ||
              Number(
                booking.totalPrice
              ) ||
              Number(
                booking.amount
              ) ||
              pricePerNight * nights;

            return (
              <article
                className="booking-list-card"
                key={booking._id}
              >

                {/* =======================================
                    CARD HEADER
                ======================================= */}

                <div className="booking-card-header">

                  <div className="booking-card-room">

                    <div className="booking-room-icon">
                      <BedDouble
                        size={23}
                      />
                    </div>

                    <div>

                      <span className="booking-card-eyebrow">
                        RESERVATION
                      </span>

                      <h2>
                        {room.roomType ||
                          room.type ||
                          "Hotel Room"}
                      </h2>

                      {room.roomNumber && (
                        <span className="booking-room-number">
                          Room{" "}
                          {room.roomNumber}
                        </span>
                      )}

                    </div>

                  </div>

                  <StatusBadge
                    status={status}
                  />

                </div>

                {/* =======================================
                    HOTEL INFORMATION
                ======================================= */}

                {(hotel.name ||
                  hotel.city) && (
                  <div className="booking-hotel-info">

                    <MapPin size={16} />

                    <span>
                      {hotel.name ||
                        "Grand Palace"}

                      {hotel.city
                        ? `, ${hotel.city}`
                        : ""}
                    </span>

                  </div>
                )}

                {/* =======================================
                    BOOKING DETAILS
                ======================================= */}

                <div className="booking-card-details">

                  {/* Check-in */}

                  <div className="booking-card-detail">

                    <div>
                      <CalendarDays
                        size={18}
                      />
                    </div>

                    <section>

                      <span>
                        CHECK-IN
                      </span>

                      <strong>
                        {formatDate(
                          booking.checkIn
                        )}
                      </strong>

                    </section>

                  </div>

                  {/* Check-out */}

                  <div className="booking-card-detail">

                    <div>
                      <CalendarDays
                        size={18}
                      />
                    </div>

                    <section>

                      <span>
                        CHECK-OUT
                      </span>

                      <strong>
                        {formatDate(
                          booking.checkOut
                        )}
                      </strong>

                    </section>

                  </div>

                  {/* Guests */}

                  <div className="booking-card-detail">

                    <div>
                      <Users size={18} />
                    </div>

                    <section>

                      <span>
                        GUESTS
                      </span>

                      <strong>
                        {booking.guests ||
                          1}
                      </strong>

                    </section>

                  </div>

                  {/* Duration */}

                  <div className="booking-card-detail">

                    <div>
                      <BedDouble
                        size={18}
                      />
                    </div>

                    <section>

                      <span>
                        DURATION
                      </span>

                      <strong>
                        {nights}{" "}
                        {nights === 1
                          ? "Night"
                          : "Nights"}
                      </strong>

                    </section>

                  </div>

                </div>

                {/* =======================================
                    CARD FOOTER
                ======================================= */}

                <div className="booking-card-footer">

                  {/* Price */}

                  <div className="booking-price">

                    <span>
                      TOTAL AMOUNT
                    </span>

                    <strong>
                      ₹
                      {totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  {/* Actions */}

                  <div className="booking-card-actions">

                    {/* View Details */}

                    <Link
                      to={`/booking-confirmation/${booking._id}`}
                      className="booking-details-button"
                    >
                      View Details

                      <ArrowRight
                        size={16}
                      />
                    </Link>

                    {/* Cancel */}

                    {canManageCancellation(
  booking
) &&
  !hasPendingCancellationRequest(
    booking
  ) && (
    <>
      {isDirectCancellationAllowed(
        booking
      ) ? (
        <button
          type="button"
          className="cancel-booking-button"
          onClick={() =>
            handleCancelClick(
              booking
            )
          }
          disabled={
            cancellingId ===
            booking._id
          }
        >
          <XCircle size={16} />

          {cancellingId ===
          booking._id
            ? "Cancelling..."
            : "Cancel Booking"}
        </button>
      ) : (
        <button
  type="button"
  className="cancel-booking-button"
  onClick={() => handleCancelClick(booking)}
  disabled={cancellingId === booking._id}
>
  <XCircle size={16} />

  {cancellingId === booking._id
    ? "Processing..."
    : (() => {
        const deadline =
          getCancellationDeadline(
            booking.checkIn
          );

        const directCancellationAllowed =
          Boolean(
            deadline &&
              new Date() <= deadline
          );

        return directCancellationAllowed
          ? "Cancel Booking"
          : "Request Cancellation";
      })()}
</button>
      )}
    </>
  )}

{hasPendingCancellationRequest(
  booking
) && (
  <div className="cancellation-request-pending">
    Cancellation Request Pending
  </div>
)}

                  </div>

                </div>

              </article>
            );
          })}

        </div>
      )}

      {/* =================================================
          CANCEL CONFIRMATION DIALOG
      ================================================= */}

      <ConfirmDialog
  open={Boolean(selectedBooking)}
  title={
    selectedBooking &&
    isDirectCancellationAllowed(
      selectedBooking
    )
      ? "Cancel Reservation?"
      : "Request Cancellation?"
  }
  message={
    selectedBooking
      ? isDirectCancellationAllowed(
          selectedBooking
        )
        ? `Are you sure you want to cancel your reservation for ${
            selectedBooking.room
              ?.roomType ||
            selectedBooking.room
              ?.type ||
            "this room"
          }? This action cannot be undone.`
        : `The 24-hour cancellation deadline has passed. You must submit a cancellation request for ${
            selectedBooking.room
              ?.roomType ||
            selectedBooking.room
              ?.type ||
            "this room"
          }. Staff approval will be required.`
      : ""
  }
  confirmText={
    cancellingId
      ? isDirectCancellationAllowed(
          selectedBooking
        )
        ? "Cancelling..."
        : "Submitting..."
      : isDirectCancellationAllowed(
          selectedBooking
        )
      ? "Cancel Booking"
      : "Request Cancellation"
  }
  cancelText="Keep Reservation"
  onConfirm={selectedBooking && (
  <p>
    {isDirectCancellationAllowed(selectedBooking)
      ? "You can cancel this booking directly."
      : "The cancellation deadline has passed. You must submit a cancellation request."}
  </p>
)}
  onCancel={() =>
    setSelectedBooking(null)
  }
/>

    </div>
  );
};

export default MyBookings;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getRooms,
  updateRoomStatus,
} from "../services/roomService";

import {
  getAllBookings,
  updateBookingStatus,
} from "../services/bookingService";

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        roomsResponse,
        bookingsResponse,
      ] = await Promise.all([
        getRooms(),
        getAllBookings(),
      ]);

      setRooms(
        roomsResponse.rooms || []
      );

      setBookings(
        bookingsResponse.bookings || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // UPDATE ROOM STATUS
  // =====================================================

  const handleRoomStatus = async (
    roomId,
    status
  ) => {
    try {
      await updateRoomStatus(
        roomId,
        status
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update room status."
      );
    }
  };

  // =====================================================
  // UPDATE BOOKING
  // =====================================================

  const handleBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      await updateBookingStatus(
        bookingId,
        status
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update booking."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    await logout();

    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      <h1>
        Receptionist Dashboard
      </h1>

      <p>
        Welcome,{" "}
        <strong>
          {user?.name}
        </strong>
      </p>

      <p>
        Email: {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>

      {error && (
        <p>{error}</p>
      )}

      <hr />

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <h2>Quick Actions</h2>

      <button
        onClick={() =>
          navigate("/rooms/search")
        }
      >
        Search Rooms
      </button>

      <button
        onClick={() =>
          navigate("/dashboard")
        }
      >
        Dashboard
      </button>

      <hr />

      {loading ? (
        <p>
          Loading dashboard...
        </p>
      ) : (
        <>
          {/* =============================================
              ROOM MANAGEMENT
          ============================================= */}

          <h2>
            Room Management
          </h2>

          {rooms.length === 0 ? (
            <p>
              No rooms found.
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                style={{
                  border:
                    "1px solid #ddd",
                  padding: "15px",
                  marginBottom:
                    "10px",
                }}
              >
                <h3>
                  Room{" "}
                  {
                    room.roomNumber
                  }
                </h3>

                <p>
                  Type:{" "}
                  {
                    room.roomType
                  }
                </p>

                <p>
                  Capacity:{" "}
                  {
                    room.capacity
                  }
                </p>

                <p>
                  Price: ₹
                  {
                    room.pricePerNight
                  }
                </p>

                <p>
                  Status:{" "}
                  {
                    room.status
                  }
                </p>

                <button
                  onClick={() =>
                    handleRoomStatus(
                      room._id,
                      "active"
                    )
                  }
                >
                  Active
                </button>

                <button
                  onClick={() =>
                    handleRoomStatus(
                      room._id,
                      "inactive"
                    )
                  }
                >
                  Inactive
                </button>

                <button
                  onClick={() =>
                    handleRoomStatus(
                      room._id,
                      "maintenance"
                    )
                  }
                >
                  Maintenance
                </button>
              </div>
            ))
          )}

          <hr />

          {/* =============================================
              BOOKING MANAGEMENT
          ============================================= */}

          <h2>
            Booking Management
          </h2>

          {bookings.length === 0 ? (
            <p>
              No bookings found.
            </p>
          ) : (
            bookings.map(
              (booking) => (
                <div
                  key={
                    booking._id
                  }
                  style={{
                    border:
                      "1px solid #ddd",
                    padding:
                      "15px",
                    marginBottom:
                      "10px",
                  }}
                >
                  <h3>
                    Room{" "}
                    {
                      booking.room
                        ?.roomNumber
                    }
                  </h3>

                  <p>
                    Customer:{" "}
                    {
                      booking
                        .customer
                        ?.name
                    }
                  </p>

                  <p>
                    Check-in:{" "}
                    {new Date(
                      booking.checkIn
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    Check-out:{" "}
                    {new Date(
                      booking.checkOut
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    Guests:{" "}
                    {
                      booking.guests
                    }
                  </p>

                  <p>
                    Total: ₹
                    {
                      booking.totalAmount
                    }
                  </p>

                  <p>
                    Status:{" "}
                    {
                      booking.status
                    }
                  </p>

                  <button
                    onClick={() =>
                      handleBookingStatus(
                        booking._id,
                        "confirmed"
                      )
                    }
                  >
                    Confirm
                  </button>

                  <button
                    onClick={() =>
                      handleBookingStatus(
                        booking._id,
                        "completed"
                      )
                    }
                  >
                    Complete
                  </button>

                  <button
                    onClick={() =>
                      handleBookingStatus(
                        booking._id,
                        "cancelled"
                      )
                    }
                  >
                    Cancel
                  </button>
                </div>
              )
            )
          )}
        </>
      )}

      <hr />

      <button
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default ReceptionistDashboard;
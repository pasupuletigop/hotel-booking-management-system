import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  DoorOpen,
  Hotel,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from "../services/roomService";

import {
  getAllBookings,
  updateBookingStatus,
} from "../services/bookingService";

import { getAllHotels } from "../services/hotelService";

const AdminDashboard = () => {
  const { user } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hotel, setHotel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [roomFilter, setRoomFilter] = useState("all");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] =
  useState("");

  const [updatingRoom, setUpdatingRoom] = useState(null);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    roomType: "double",
    capacity: 2,
    pricePerNight: "",
    amenities: "",
    description: "",
    status: "active",
  });

  const [roomFormError, setRoomFormError] = useState("");
  const [savingRoom, setSavingRoom] = useState(false);

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        roomsResponse,
        bookingsResponse,
        hotelResponse,
      ] = await Promise.all([
        getRooms(),
        getAllBookings(),
        getAllHotels(),
      ]);

      // Rooms
      const extractedRooms =
        roomsResponse?.rooms ||
        roomsResponse?.data?.rooms ||
        roomsResponse?.data ||
        [];

      // Bookings
      const extractedBookings =
        bookingsResponse?.bookings ||
        bookingsResponse?.data?.bookings ||
        bookingsResponse?.data ||
        [];

      // Hotel
      // Hotel
const extractedHotel =
  hotelResponse?.hotel ||
  hotelResponse?.data?.hotel ||
  hotelResponse?.hotels?.[0] ||
  hotelResponse?.data?.hotels?.[0] ||
  null;

      setRooms(
        Array.isArray(extractedRooms)
          ? extractedRooms
          : []
      );

      setBookings(
        Array.isArray(extractedBookings)
          ? extractedBookings
          : []
      );

      setHotel(
        extractedHotel &&
          !Array.isArray(extractedHotel)
          ? extractedHotel
          : null
      );
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // ROOM STATISTICS
  // =========================================================

  const roomStats = useMemo(() => {
    return {
      total: rooms.length,

      active: rooms.filter(
        (room) => room.status === "active"
      ).length,

      maintenance: rooms.filter(
        (room) => room.status === "maintenance"
      ).length,

      inactive: rooms.filter(
        (room) => room.status === "inactive"
      ).length,
    };
  }, [rooms]);

  // =========================================================
  // BOOKING STATISTICS
  // =========================================================

  const bookingStats = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter(
        (booking) => booking.status === "pending"
      ).length,

      confirmed: bookings.filter(
        (booking) => booking.status === "confirmed"
      ).length,

      cancelled: bookings.filter(
        (booking) => booking.status === "cancelled"
      ).length,

      completed: bookings.filter(
        (booking) => booking.status === "completed"
      ).length,
    };
  }, [bookings]);

  // =========================================================
  // REVENUE
  // =========================================================

  const revenue = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          booking.status === "confirmed" ||
          booking.status === "completed"
      )
      .reduce(
        (total, booking) =>
          total +
          Number(booking.totalAmount || 0),
        0
      );
  }, [bookings]);

  // =========================================================
  // FILTERED ROOMS
  // =========================================================

  const filteredRooms = useMemo(() => {
    if (roomFilter === "all") {
      return rooms;
    }

    return rooms.filter(
      (room) => room.status === roomFilter
    );
  }, [rooms, roomFilter]);

  // =========================================================
  // FILTERED BOOKINGS
  // =========================================================

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "all") {
      return bookings;
    }

    return bookings.filter(
      (booking) =>
        booking.status === bookingFilter
    );
  }, [bookings, bookingFilter]);

  // =========================================================
  // FORMAT HELPERS
  // =========================================================

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

  const formatCurrency = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  const getGuestName = (booking) => {
    if (!booking?.customer) {
      return "Guest";
    }

    if (
      typeof booking.customer === "string"
    ) {
      return booking.customer;
    }

    return (
      booking.customer.name ||
      booking.customer.fullName ||
      booking.customer.email ||
      "Guest"
    );
  };

  const getRoomNumber = (booking) => {
    if (!booking?.room) {
      return "—";
    }

    if (
      typeof booking.room === "string"
    ) {
      return booking.room;
    }

    return (
      booking.room.roomNumber ||
      "—"
    );
  };

  // =========================================================
  // ROOM STATUS
  // =========================================================

  const handleRoomStatus = async (
    roomId,
    status
  ) => {
    try {
      setUpdatingRoom(roomId);

      setError("");

      await updateRoomStatus(
        roomId,
        status
      );

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room._id === roomId
            ? {
                ...room,
                status,
              }
            : room
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to update room status."
      );
    } finally {
      setUpdatingRoom(null);
    }
  };

  // =========================================================
  // DELETE ROOM
  // =========================================================

  const handleDeleteRoom = async (
    roomId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRoom(roomId);
      setError("");

      await deleteRoom(roomId);

      setRooms((currentRooms) =>
        currentRooms.filter(
          (room) => room._id !== roomId
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete the room."
      );
    } finally {
      setDeletingRoom(null);
    }
  };

  // =========================================================
  // BOOKING STATUS
  // =========================================================

  const handleBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      setUpdatingBooking(bookingId);

      setError("");

      await updateBookingStatus(
        bookingId,
        status
      );

      setBookings((currentBookings) =>
        currentBookings.map(
          (booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status,
                }
              : booking
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingBooking(null);
    }
  };

  // =========================================================
  // OPEN ADD ROOM MODAL
  // =========================================================

  const openAddRoomModal = () => {
    setEditingRoom(null);

    setRoomForm({
      roomNumber: "",
      roomType: "double",
      capacity: 2,
      pricePerNight: "",
      amenities: "",
      description: "",
      status: "active",
    });

    setRoomFormError("");
    setShowRoomModal(true);
  };

  // =========================================================
  // OPEN EDIT ROOM MODAL
  // =========================================================

  const openEditRoomModal = (room) => {
    setEditingRoom(room);

    setRoomForm({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "double",
      capacity: room.capacity || 1,
      pricePerNight:
        room.pricePerNight || "",
      amenities: Array.isArray(
        room.amenities
      )
        ? room.amenities.join(", ")
        : "",
      description:
        room.description || "",
      status:
        room.status || "active",
    });

    setRoomFormError("");
    setShowRoomModal(true);
  };

  // =========================================================
  // CLOSE ROOM MODAL
  // =========================================================

  const closeRoomModal = () => {
    if (savingRoom) {
      return;
    }

    setShowRoomModal(false);
    setEditingRoom(null);
    setRoomFormError("");
  };

  // =========================================================
  // ROOM FORM CHANGE
  // =========================================================

  const handleRoomFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setRoomForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE ROOM
  // =========================================================

  const handleRoomSubmit = async (
    event
  ) => {
    event.preventDefault();

    setRoomFormError("");

    // Validation
    if (
      !roomForm.roomNumber.trim()
    ) {
      setRoomFormError(
        "Room number is required."
      );
      return;
    }

    if (
      Number(roomForm.capacity) < 1
    ) {
      setRoomFormError(
        "Capacity must be at least 1."
      );
      return;
    }

    if (
      roomForm.pricePerNight === ""
    ) {
      setRoomFormError(
        "Price per night is required."
      );
      return;
    }

    if (
      Number(roomForm.pricePerNight) < 0
    ) {
      setRoomFormError(
        "Price cannot be negative."
      );
      return;
    }

    if (!hotel?._id) {
      setRoomFormError(
        "Hotel information is not available. Please create the hotel first."
      );
      return;
    }

    const roomData = {
      hotel: hotel._id,

      roomNumber:
        roomForm.roomNumber.trim(),

      roomType:
        roomForm.roomType,

      capacity:
        Number(roomForm.capacity),

      pricePerNight:
        Number(
          roomForm.pricePerNight
        ),

      amenities:
        roomForm.amenities
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      description:
        roomForm.description.trim(),

      status:
        roomForm.status,
    };

    try {
      setSavingRoom(true);

      setRoomFormError("");

      // EDIT ROOM
      if (editingRoom) {
        const response =
          await updateRoom(
            editingRoom._id,
            roomData
          );

        const updatedRoom =
          response?.room ||
          response?.data?.room ||
          response?.data ||
          roomData;

        setRooms(
          (currentRooms) =>
            currentRooms.map(
              (room) =>
                room._id ===
                editingRoom._id
                  ? {
                      ...room,
                      ...updatedRoom,
                      _id: room._id,
                    }
                  : room
            )
        );
      }

      // CREATE ROOM
      else {
        const response =
          await createRoom(
            roomData
          );

        const newRoom =
          response?.room ||
          response?.data?.room ||
          response?.data;

        if (newRoom) {
          setRooms(
            (currentRooms) => [
              newRoom,
              ...currentRooms,
            ]
          );
        } else {
          await loadDashboard(
            true
          );
        }
      }

      closeRoomModal();
    } catch (err) {
      console.error(
        "Room save error:",
        err
      );

      setRoomFormError(
        err?.response?.data?.message ||
          "Unable to save room. Please try again."
      );
    } finally {
      setSavingRoom(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoaderCircle
          size={32}
          className="spin"
        />

        <p>
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="admin-dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Welcome back
            {user?.name
              ? `, ${user.name}`
              : ""}
          </h1>

          <p>
            Manage your hotel, rooms and
            reservations from one place.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="dashboard-alert dashboard-alert-error">
          <XCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          HOTEL OVERVIEW
          ===================================================== */}

      <section className="admin-hotel-overview">
        <div className="hotel-overview-icon">
          <Hotel size={25} />
        </div>

        <div className="hotel-overview-content">
          <span>
            PROPERTY
          </span>

          <h2>
            {hotel?.name ||
              "Grand Palace Hotel"}
          </h2>

          <p>
            {hotel?.address
              ? `${hotel.address}, ${
                  hotel.city || ""
                }`
              : "Premium hotel booking management"}
          </p>
        </div>

        <div className="hotel-overview-status">
          <CheckCircle2 size={16} />

          {hotel?.status ||
            "active"}
        </div>
      </section>

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="admin-stats-grid">

        {/* TOTAL ROOMS */}

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>
              Total Rooms
            </span>

            <strong>
              {roomStats.total}
            </strong>
          </div>

          <small>
            {roomStats.active} active
          </small>
        </div>

        {/* ACTIVE ROOMS */}

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <DoorOpen size={21} />
          </div>

          <div>
            <span>
              Active Rooms
            </span>

            <strong>
              {roomStats.active}
            </strong>
          </div>

          <small>
            {roomStats.maintenance}{" "}
            maintenance
          </small>
        </div>

        {/* BOOKINGS */}

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <CalendarCheck
              size={21}
            />
          </div>

          <div>
            <span>
              Bookings
            </span>

            <strong>
              {bookingStats.total}
            </strong>
          </div>

          <small>
            {bookingStats.confirmed}{" "}
            confirmed
          </small>
        </div>

        {/* REVENUE */}

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>
              Revenue
            </span>

            <strong>
              {formatCurrency(
                revenue
              )}
            </strong>
          </div>

          <small>
            Confirmed + completed
          </small>
        </div>
      </section>

      {/* =====================================================
          ROOM MANAGEMENT
          ===================================================== */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>
            <span className="dashboard-eyebrow">
              ACCOMMODATION
            </span>

            <h2>
              Room Management
            </h2>

            <p>
              Manage room availability
              and operational status.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={
              openAddRoomModal
            }
          >
            <Plus size={17} />
            Add Room
          </button>
        </div>

        {/* ROOM FILTERS */}

        <div className="admin-filter-row">
          <div className="admin-filter-tabs">

            <button
              type="button"
              className={
                roomFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoomFilter("all")
              }
            >
              All
              <span>
                {roomStats.total}
              </span>
            </button>

            <button
              type="button"
              className={
                roomFilter === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoomFilter(
                  "active"
                )
              }
            >
              Active
              <span>
                {roomStats.active}
              </span>
            </button>

            <button
              type="button"
              className={
                roomFilter ===
                "maintenance"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoomFilter(
                  "maintenance"
                )
              }
            >
              Maintenance
              <span>
                {
                  roomStats.maintenance
                }
              </span>
            </button>

            <button
              type="button"
              className={
                roomFilter ===
                "inactive"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoomFilter(
                  "inactive"
                )
              }
            >
              Inactive
              <span>
                {roomStats.inactive}
              </span>
            </button>

          </div>
        </div>

        {/* ROOM TABLE */}

        {filteredRooms.length ===
        0 ? (
          <div className="admin-empty-state">
            <DoorOpen size={34} />

            <h3>
              No rooms found
            </h3>

            <p>
              There are no rooms
              matching the selected
              filter.
            </p>
          </div>
        ) : (
          <div className="admin-room-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>
                    Room
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Capacity
                  </th>

                  <th>
                    Price / Night
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredRooms.map(
                  (room) => (
                    <tr
                      key={room._id}
                    >

                      {/* ROOM */}

                      <td>
                        <div className="table-room-name">

                          <div className="table-room-icon">
                            <DoorOpen
                              size={17}
                            />
                          </div>

                          <div>
                            <strong>
                              Room{" "}
                              {
                                room.roomNumber
                              }
                            </strong>

                            <span>
                              {room.hotel?.name ||
                                "Grand Palace Hotel"}
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span className="capitalize">
                          {room.roomType ||
                            "—"}
                        </span>
                      </td>

                      {/* CAPACITY */}

                      <td>
                        <span className="table-with-icon">
                          <Users
                            size={15}
                          />

                          {room.capacity ||
                            1}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td>
                        <strong>
                          {formatCurrency(
                            room.pricePerNight
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-badge status-${room.status}`}
                        >
                          {room.status}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="table-actions">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="icon-action-button"
                            title="Edit room"
                            onClick={() =>
                              openEditRoomModal(
                                room
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          {/* STATUS */}

                          <select
                            value={
                              room.status
                            }
                            disabled={
                              updatingRoom ===
                              room._id
                            }
                            onChange={(
                              event
                            ) =>
                              handleRoomStatus(
                                room._id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="active">
                              Active
                            </option>

                            <option value="maintenance">
                              Maintenance
                            </option>

                            <option value="inactive">
                              Inactive
                            </option>
                          </select>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="icon-action-button danger"
                            title="Delete room"
                            disabled={
                              deletingRoom ===
                              room._id
                            }
                            onClick={() =>
                              handleDeleteRoom(
                                room._id
                              )
                            }
                          >
                            {deletingRoom ===
                            room._id ? (
                              <LoaderCircle
                                size={16}
                                className="spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================
          BOOKING MANAGEMENT
          ===================================================== */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>
            <span className="dashboard-eyebrow">
              RESERVATIONS
            </span>

            <h2>
              Booking Management
            </h2>

            <p>
              Review and manage guest
              reservations.
            </p>
          </div>

          <div className="booking-summary-mini">

            <span>
              <CheckCircle2
                size={15}
              />

              {
                bookingStats.confirmed
              }{" "}
              confirmed
            </span>

            <span>
              <Users size={15} />

              {bookingStats.total}{" "}
              total
            </span>

          </div>
        </div>

        {/* BOOKING FILTERS */}

        <div className="admin-filter-row">

          <div className="admin-filter-tabs">

            <button
              type="button"
              className={
                bookingFilter ===
                "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setBookingFilter(
                  "all"
                )
              }
            >
              All

              <span>
                {bookingStats.total}
              </span>
            </button>

            <button
              type="button"
              className={
                bookingFilter ===
                "pending"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setBookingFilter(
                  "pending"
                )
              }
            >
              Pending

              <span>
                {bookingStats.pending}
              </span>
            </button>

            <button
              type="button"
              className={
                bookingFilter ===
                "confirmed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setBookingFilter(
                  "confirmed"
                )
              }
            >
              Confirmed

              <span>
                {bookingStats.confirmed}
              </span>
            </button>

            <button
              type="button"
              className={
                bookingFilter ===
                "completed"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setBookingFilter(
                  "completed"
                )
              }
            >
              Completed

              <span>
                {bookingStats.completed}
              </span>
            </button>

            <button
              type="button"
              className={
                bookingFilter ===
                "cancelled"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setBookingFilter(
                  "cancelled"
                )
              }
            >
              Cancelled

              <span>
                {bookingStats.cancelled}
              </span>
            </button>

          </div>
        </div>

        {/* BOOKINGS */}

        {filteredBookings.length ===
        0 ? (
          <div className="admin-empty-state">

            <CalendarCheck
              size={34}
            />

            <h3>
              No bookings found
            </h3>

            <p>
              There are no reservations
              matching this filter.
            </p>

          </div>
        ) : (
          <div className="admin-booking-table-wrapper">

            <table className="admin-table booking-table">

              <thead>
                <tr>

                  <th>
                    Guest
                  </th>

                  <th>
                    Room
                  </th>

                  <th>
                    Stay
                  </th>

                  <th>
                    Guests
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Update
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredBookings.map(
                  (booking) => (
                    <tr
                      key={
                        booking._id
                      }
                    >

                      {/* GUEST */}

                      <td>
                        <div className="guest-cell">

                          <div className="guest-avatar">
                            {getGuestName(
                              booking
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getGuestName(
                                booking
                              )}
                            </strong>

                            <span>
                              #
                              {String(
                                booking._id
                              ).slice(
                                -8
                              )}
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* ROOM */}

                      <td>
                        <strong>
                          Room{" "}
                          {getRoomNumber(
                            booking
                          )}
                        </strong>
                      </td>

                      {/* STAY */}

                      <td>
                        <div className="stay-cell">

                          <strong>
                            {formatDate(
                              booking.checkIn
                            )}
                          </strong>

                          <span>
                            to{" "}
                            {formatDate(
                              booking.checkOut
                            )}
                          </span>

                        </div>
                      </td>

                      {/* GUEST COUNT */}

                      <td>
                        <span className="table-with-icon">
                          <Users
                            size={15}
                          />

                          {booking.guests ||
                            1}
                        </span>
                      </td>

                      {/* TOTAL */}

                      <td>
                        <strong>
                          {formatCurrency(
                            booking.totalAmount
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-badge status-${booking.status}`}
                        >
                          {
                            booking.status
                          }
                        </span>
                      </td>

                      {/* UPDATE */}

                      <td>

                        <div className="booking-status-control">

                          <select
                            value={
                              booking.status
                            }
                            disabled={
                              updatingBooking ===
                              booking._id
                            }
                            onChange={(
                              event
                            ) =>
                              handleBookingStatus(
                                booking._id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >

                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="completed">
                              Completed
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>

                          </select>

                          <ChevronDown
                            size={14}
                          />

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>

          </div>
        )}

      </section>

      {/* =====================================================
          QUICK ACTIONS
          ===================================================== */}

      <section className="admin-quick-actions">

        <div>
          <span className="dashboard-eyebrow">
            QUICK ACTIONS
          </span>

          <h2>
            Hotel Operations
          </h2>
        </div>

        <div className="quick-actions-grid">

          {/* ADD ROOM */}

          <button
            type="button"
            onClick={
              openAddRoomModal
            }
          >
            <Plus size={20} />

            <div>
              <strong>
                Add New Room
              </strong>

              <span>
                Create a new room
                listing
              </span>
            </div>
          </button>

          {/* BOOKINGS */}

          <button type="button">
            <CalendarCheck
              size={20}
            />

            <div>
              <strong>
                Review Bookings
              </strong>

              <span>
                Manage guest
                reservations
              </span>
            </div>
          </button>

          {/* HOTEL */}

          <button type="button">
            <Building2 size={20} />

            <div>
              <strong>
                Hotel Information
              </strong>

              <span>
                View property
                details
              </span>
            </div>
          </button>

        </div>
      </section>

      {/* =====================================================
          ADD / EDIT ROOM MODAL
          ===================================================== */}

      {showRoomModal && (
        <div
          className="room-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeRoomModal();
            }
          }}
        >

          <div className="room-modal">

            {/* MODAL HEADER */}

            <div className="room-modal-header">

              <div>

                <span className="dashboard-eyebrow">
                  ROOM MANAGEMENT
                </span>

                <h2>
                  {editingRoom
                    ? "Edit Room"
                    : "Add New Room"}
                </h2>

                <p>
                  {editingRoom
                    ? "Update the room information below."
                    : "Create a new room for your hotel."}
                </p>

              </div>

              <button
                type="button"
                className="room-modal-close"
                onClick={
                  closeRoomModal
                }
                disabled={
                  savingRoom
                }
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              className="room-modal-form"
              onSubmit={
                handleRoomSubmit
              }
            >

              {/* FORM ERROR */}

              {roomFormError && (
                <div className="room-form-error">

                  <XCircle
                    size={17}
                  />

                  <span>
                    {roomFormError}
                  </span>

                </div>
              )}

              <div className="room-form-grid">

                {/* ROOM NUMBER */}

                <div className="form-group">

                  <label htmlFor="roomNumber">
                    Room Number
                  </label>

                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    placeholder="e.g. 201"
                    value={
                      roomForm.roomNumber
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  />

                </div>

                {/* ROOM TYPE */}

                <div className="form-group">

                  <label htmlFor="roomType">
                    Room Type
                  </label>

                  <select
                    id="roomType"
                    name="roomType"
                    value={
                      roomForm.roomType
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  >

                    <option value="single">
                      Single
                    </option>

                    <option value="double">
                      Double
                    </option>

                    <option value="twin">
                      Twin
                    </option>

                    <option value="suite">
                      Suite
                    </option>

                    <option value="deluxe">
                      Deluxe
                    </option>

                  </select>

                </div>

                {/* CAPACITY */}

                <div className="form-group">

                  <label htmlFor="capacity">
                    Guest Capacity
                  </label>

                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={
                      roomForm.capacity
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  />

                </div>

                {/* PRICE */}

                <div className="form-group">

                  <label htmlFor="pricePerNight">
                    Price Per Night
                  </label>

                  <input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="number"
                    min="0"
                    placeholder="e.g. 3000"
                    value={
                      roomForm.pricePerNight
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  />

                </div>

                {/* AMENITIES */}

                <div className="form-group form-group-full">

                  <label htmlFor="amenities">
                    Amenities
                  </label>

                  <input
                    id="amenities"
                    name="amenities"
                    type="text"
                    placeholder="WiFi, TV, AC, Parking"
                    value={
                      roomForm.amenities
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  />

                  <small>
                    Separate amenities
                    with commas.
                  </small>

                </div>

                {/* DESCRIPTION */}

                <div className="form-group form-group-full">

                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    placeholder="Describe this room..."
                    value={
                      roomForm.description
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  />

                </div>

                {/* STATUS */}

                <div className="form-group">

                  <label htmlFor="status">
                    Room Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={
                      roomForm.status
                    }
                    onChange={
                      handleRoomFormChange
                    }
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="maintenance">
                      Maintenance
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="room-modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeRoomModal
                  }
                  disabled={
                    savingRoom
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingRoom
                  }
                >

                  {savingRoom ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      {editingRoom ? (
                        <Pencil
                          size={17}
                        />
                      ) : (
                        <Plus
                          size={17}
                        />
                      )}

                      {editingRoom
                        ? "Save Changes"
                        : "Create Room"}
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
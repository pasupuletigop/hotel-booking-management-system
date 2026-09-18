import api from "./api";

// =====================================================
// CREATE BOOKING
// =====================================================

export const createBooking = async ({
  room,
  checkIn,
  checkOut,
  guests,
}) => {
  const response = await api.post(
    "/bookings",
    {
      room,
      checkIn,
      checkOut,
      guests,
    }
  );

  return response.data;
};

// =====================================================
// GET MY BOOKINGS
// =====================================================

export const getMyBookings = async () => {
  const response =
    await api.get(
      "/bookings/my"
    );

  return response.data;
};

// =====================================================
// GET SINGLE BOOKING
// =====================================================

export const getBookingById =
  async (id) => {
    const response =
      await api.get(
        `/bookings/${id}`
      );

    return response.data;
  };

// =====================================================
// DIRECT CANCEL BOOKING
// =====================================================

export const cancelBooking =
  async (id) => {
    const response =
      await api.patch(
        `/bookings/${id}/cancel`
      );

    return response.data;
  };

// =====================================================
// REQUEST LATE CANCELLATION
// =====================================================

export const requestBookingCancellation =
  async (id, reason) => {
    const response =
      await api.post(
        `/bookings/${id}/cancellation-request`,
        {
          reason,
        }
      );

    return response.data;
  };

// =====================================================
// REVIEW CANCELLATION REQUEST
// ADMIN / RECEPTIONIST
// =====================================================

export const reviewCancellationRequest =
  async (
    id,
    decision
  ) => {
    const response =
      await api.patch(
        `/bookings/${id}/cancellation-request/review`,
        {
          decision,
        }
      );

    return response.data;
  };

// =====================================================
// GET ALL BOOKINGS
// ADMIN / RECEPTIONIST
// =====================================================

export const getAllBookings =
  async ({
    status,
    search,
    cancellationRequestStatus,
  } = {}) => {
    const params = {};

    if (
      status &&
      status !== "all"
    ) {
      params.status = status;
    }

    if (
      cancellationRequestStatus &&
      cancellationRequestStatus !==
        "all"
    ) {
      params.cancellationRequestStatus =
        cancellationRequestStatus;
    }

    if (search?.trim()) {
      params.search =
        search.trim();
    }

    const response =
      await api.get(
        "/bookings",
        {
          params,
        }
      );

    return response.data;
  };

// =====================================================
// UPDATE BOOKING STATUS
// ADMIN / RECEPTIONIST
// =====================================================

export const updateBookingStatus =
  async (
    id,
    status
  ) => {
    const response =
      await api.patch(
        `/bookings/${id}/status`,
        {
          status,
        }
      );

    return response.data;
  };
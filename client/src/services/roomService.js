import api from "./api";

// =====================================================
// GET ALL ROOMS
// =====================================================

export const getRooms = async () => {
  const response = await api.get("/rooms");

  return response.data;
};

// =====================================================
// GET ACTIVE ROOMS
// =====================================================

export const getActiveRooms = async () => {
  const response = await api.get("/rooms/active");

  return response.data;
};

// =====================================================
// GET AVAILABLE ROOMS
// =====================================================

export const getAvailableRooms = async ({
  checkIn,
  checkOut,
  guests,
}) => {
  const response = await api.get(
    "/rooms/available",
    {
      params: {
        checkIn,
        checkOut,
        guests,
      },
    }
  );

  return response.data;
};

// =====================================================
// GET SINGLE ROOM
// =====================================================

export const getRoomById = async (id) => {
  const response = await api.get(
    `/rooms/${id}`
  );

  return response.data;
};

// =====================================================
// CREATE ROOM
// ADMIN / RECEPTIONIST
// =====================================================

export const createRoom = async (roomData) => {
  const response = await api.post(
    "/rooms",
    roomData
  );

  return response.data;
};

// =====================================================
// UPDATE ROOM
// ADMIN / RECEPTIONIST
// =====================================================

export const updateRoom = async (
  id,
  roomData
) => {
  const response = await api.put(
    `/rooms/${id}`,
    roomData
  );

  return response.data;
};

// =====================================================
// UPDATE ROOM STATUS
// ADMIN / RECEPTIONIST
// =====================================================

export const updateRoomStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/rooms/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};

// =====================================================
// DELETE ROOM
// ADMIN ONLY
// =====================================================

export const deleteRoom = async (id) => {
  const response = await api.delete(
    `/rooms/${id}`
  );

  return response.data;
};
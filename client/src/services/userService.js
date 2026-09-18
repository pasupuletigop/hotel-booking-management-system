import api from "./api";

// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};

// =====================================================
// CREATE RECEPTIONIST
// =====================================================

export const createReceptionist = async (userData) => {
  const response = await api.post(
    "/users/receptionist",
    userData
  );

  return response.data;
};
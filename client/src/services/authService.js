import api from "./api";

// =====================================================
// REGISTER
// =====================================================

export const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  return response.data;
};

// =====================================================
// GOOGLE LOGIN
// =====================================================

export const googleLoginUser = async (credential) => {
  const response = await api.post(
    "/auth/google",
    {
      credential,
    }
  );

  return response.data;
};
export const getCurrentUser = async () => {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
};
// =====================================================
// LOGOUT
// =====================================================

export const logoutUser = async () => {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
};

// =====================================================
// GET CURRENT USER
// =====================================================


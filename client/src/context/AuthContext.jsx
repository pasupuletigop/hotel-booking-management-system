import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  googleLoginUser,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CHECK EXISTING LOGIN
  // =====================================================

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await getCurrentUser();

        setUser(response.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (userData) => {
    const response = await registerUser(userData);

    setUser(response.user);

    return response;
  };

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    setUser(response.user);

    return response;
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const googleLogin = async (credential) => {
    const response = await googleLoginUser(credential);

    setUser(response.user);

    return response;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    await logoutUser();

    setUser(null);
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    user,
    loading,

    register,
    login,
    googleLogin,
    logout,

    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// CUSTOM HOOK
// =====================================================

export const useAuth = () => {
  return useContext(AuthContext);
};
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "receptionist") {
    return <Navigate to="/receptionist" replace />;
  }

  return <Navigate to="/customer" replace />;
};

export default Dashboard;
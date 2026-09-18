import { Navigate, Route, Routes } from "react-router-dom";

// =====================================================
// COMMON COMPONENTS
// =====================================================

import AppLayout from "./components/common/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =====================================================
// DASHBOARDS
// =====================================================

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import SearchRooms from "./pages/SearchRooms";
import BookRoom from "./pages/BookRoom";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import AdminUsers from "./pages/AdminUsers";
import CreateReceptionist from "./pages/CreateReceptionist";

// =====================================================
// AI
// =====================================================

import AiConcierge from "./pages/AiConcierge";

const App = () => {
  return (
    <Routes>

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =================================================
          PROTECTED APPLICATION ROUTES
      ================================================= */}

      <Route element={<AppLayout />}>

        {/* =================================================
            AUTHENTICATED USERS
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/rooms/search"
            element={<SearchRooms />}
          />

          <Route
            path="/ai-concierge"
            element={<AiConcierge />}
          />

        </Route>

        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
          <Route
  path="/admin/users"
  element={<AdminUsers />}

 />
<Route
    path="/admin/users/create-receptionist"
    element={<CreateReceptionist />}
  />
        </Route>

        {/* =================================================
            RECEPTIONIST ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["receptionist"]}
            />
          }
        >

          <Route
            path="/receptionist"
            element={<ReceptionistDashboard />}
          />

        </Route>

        {/* =================================================
            CUSTOMER ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["customer"]} />
          }
        >

          <Route
            path="/customer"
            element={<CustomerDashboard />}
          />

          <Route
            path="/book-room"
            element={<BookRoom />}
          />

          <Route
            path="/booking-confirmation/:id"
            element={<BookingConfirmation />}
          />

          <Route
            path="/customer/bookings"
            element={<MyBookings />}
          />

        </Route>

      </Route>

      {/* =================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
};

export default App;
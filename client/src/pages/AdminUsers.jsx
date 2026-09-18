import { useEffect, useState } from "react";

import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getAllUsers } from "../services/userService";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUsers();

      const extractedUsers =
        response?.users ||
        response?.data?.users ||
        [];

      setUsers(
        Array.isArray(extractedUsers)
          ? extractedUsers
          : []
      );
    } catch (err) {
      console.error("Unable to load users:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // ROLE COUNTS
  // =====================================================

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const receptionistCount = users.filter(
    (user) => user.role === "receptionist"
  ).length;

  const customerCount = users.filter(
    (user) => user.role === "customer"
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoaderCircle
          size={32}
          className="spin"
        />

        <p>
          Loading user management...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="admin-dashboard-header">

        <div>

          <button
            type="button"
            className="user-back-button"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <span className="dashboard-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            User Management
          </h1>

          <p>
            Manage staff accounts and system access
            for Grand Palace.
          </p>

        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            navigate(
              "/admin/users/create-receptionist"
            )
          }
        >
          <UserPlus size={17} />
          Create Receptionist
        </button>

      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-alert dashboard-alert-error">

          <ShieldCheck size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadUsers}
            title="Retry"
          >
            <RefreshCw size={16} />
          </button>

        </div>
      )}

      {/* =================================================
          USER SUMMARY
      ================================================= */}

      <section className="admin-stats-grid">

        {/* TOTAL */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>
              Total Users
            </span>

            <strong>
              {users.length}
            </strong>
          </div>

        </div>

        {/* ADMINISTRATORS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>
              Administrators
            </span>

            <strong>
              {adminCount}
            </strong>
          </div>

        </div>

        {/* RECEPTIONISTS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <UserPlus size={21} />
          </div>

          <div>
            <span>
              Receptionists
            </span>

            <strong>
              {receptionistCount}
            </strong>
          </div>

        </div>

        {/* CUSTOMERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>
              Customers
            </span>

            <strong>
              {customerCount}
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          USER TABLE
      ================================================= */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>

            <span className="dashboard-eyebrow">
              ACCESS CONTROL
            </span>

            <h2>
              System Users
            </h2>

            <p>
              View accounts and their assigned
              application roles.
            </p>

          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate(
                "/admin/users/create-receptionist"
              )
            }
          >
            <Plus size={17} />
            Add Receptionist
          </button>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {users.length === 0 ? (

          <div className="admin-empty-state">

            <Users size={34} />

            <h3>
              No users found
            </h3>

            <p>
              No user accounts are currently
              available.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate(
                  "/admin/users/create-receptionist"
                )
              }
            >
              <UserPlus size={17} />
              Create Receptionist
            </button>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="admin-user-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={
                      user._id ||
                      user.id
                    }
                  >

                    {/* USER */}

                    <td>

                      <div className="guest-cell">

                        <div className="guest-avatar">

                          {user.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}

                        </div>

                        <div>

                          <strong>
                            {user.name || "Unknown User"}
                          </strong>

                          <span>
                            User account
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td>

                      <span className="table-with-icon">

                        <Mail size={15} />

                        {user.email || "—"}

                      </span>

                    </td>

                    {/* ROLE */}

                    <td>

                      <span
                        className={`status-badge status-${user.role}`}
                      >
                        {user.role === "admin"
                          ? "Administrator"
                          : user.role === "receptionist"
                          ? "Receptionist"
                          : "Customer"}
                      </span>

                    </td>

                    {/* CREATED */}

                    <td>
                      {formatDate(
                        user.createdAt
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default AdminUsers;
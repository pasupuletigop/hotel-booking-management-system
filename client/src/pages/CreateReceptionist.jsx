import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { createReceptionist } from "../services/userService";
const CreateReceptionist = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await createReceptionist({
        name,
        email,
        password,
      });

      setSuccess(
        response?.message || "Receptionist account created successfully."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setShowPassword(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create receptionist account.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-receptionist-page">
      {/* Page Heading */}
      <div className="create-receptionist-heading">
        <button
          type="button"
          className="user-back-button"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft size={17} />
          Back to Users
        </button>

        <div className="create-receptionist-title-row">
          <div>
            <div className="create-receptionist-eyebrow">
              USER MANAGEMENT
            </div>

            <h1>Create Receptionist</h1>

            <p>
              Create a staff account for hotel reception operations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="create-receptionist-layout">
        {/* Form Card */}
        <div className="create-receptionist-card">
          {/* Information Banner */}
          <div className="staff-account-info">
            <div className="staff-account-icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h3>Staff Account</h3>

              <p>
                This will create a receptionist account with access to
                reception operations. The user can log in with the
                provided credentials.
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="create-receptionist-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="create-receptionist-alert success">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="create-form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <div className="create-input-wrapper">
                <div className="create-input-icon">
                  <User size={19} />
                </div>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="create-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="create-input-wrapper">
                <div className="create-input-icon">
                  <Mail size={19} />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="receptionist@grandpalace.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="create-form-group">
              <label htmlFor="password">
                Temporary Password
              </label>

              <div className="create-input-wrapper">
                <div className="create-input-icon">
                  <ShieldCheck size={19} />
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle-button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="create-form-help">
                Give this password securely to the receptionist.
              </p>
            </div>

            {/* Assigned Role */}
            <div className="create-form-group">
              <label>Assigned Role</label>

              <div className="receptionist-role-card">
                <div className="receptionist-role-icon">
                  <ShieldCheck size={27} />
                </div>

                <div>
                  <strong>Receptionist</strong>

                  <span>
                    Manage guest reservations and reception
                    operations.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="create-receptionist-actions">
              <button
                type="button"
                className="create-cancel-button"
                onClick={() => navigate("/admin/users")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="create-loading-icon"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={19} />
                    Create Receptionist
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Hospitality Image Panel */}
        <div className="create-receptionist-visual">
          <div className="create-receptionist-visual-overlay">
            <div className="visual-eyebrow">
              GREAT PEOPLE
            </div>

            <div className="visual-line"></div>

            <h2>
              Exceptional
              <br />
              <em>experiences.</em>
            </h2>

            <p>
              Empower your team to deliver world-class
              hospitality at Grand Palace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReceptionist;
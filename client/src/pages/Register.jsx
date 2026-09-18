import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UserCheck,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    googleLogin,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please create a password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // SECURITY
      // =================================================
      // Never send admin/receptionist role from public
      // registration.
      //
      // Backend should automatically create this account
      // with role = "customer".
      // =================================================

      const response = await register({
        name,
        email,
        password: formData.password,
      });

      const role = response?.user?.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "receptionist") {
        navigate("/receptionist");
      } else {
        navigate("/customer");
      }

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE REGISTER / LOGIN
  // =====================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");

      const response = await googleLogin(
        credentialResponse.credential
      );

      const role = response?.user?.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "receptionist") {
        navigate("/receptionist");
      } else {
        navigate("/customer");
      }

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Google authentication failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.");
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="auth-visual">

          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">

            {/* BRAND */}

            <Link to="/" className="auth-brand">

              <div className="auth-brand-icon">
                GP
              </div>

              <div>
                <div className="auth-brand-name">
                  Grand Palace
                </div>

                <div className="auth-brand-subtitle">
                  HOTEL & RESORT
                </div>
              </div>

            </Link>

            {/* HERO */}

            <div className="auth-visual-text">

              <span className="auth-small-label">
                YOUR GRAND PALACE JOURNEY
              </span>

              <h1>
                Create memories
                <br />
                <em>worth remembering.</em>
              </h1>

              <p>
                Create your guest account and enjoy seamless
                reservations, effortless booking management,
                and exceptional hospitality.
              </p>

            </div>

            {/* TRUST */}

            <div className="auth-trust-row">

              <div>
                <strong>5.0</strong>
                <span>Guest Rating</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Guest Support</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Secure Booking</span>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <section className="auth-form-section">

          <div className="auth-form-wrapper">

            {/* MOBILE BRAND */}

            <div className="auth-mobile-brand">

              <div className="auth-brand-icon">
                GP
              </div>

              <div>
                <div className="auth-brand-name">
                  Grand Palace
                </div>

                <div className="auth-brand-subtitle">
                  HOTEL & RESORT
                </div>
              </div>

            </div>

            {/* HEADING */}

            <div className="auth-heading">

              <span className="auth-eyebrow">
                GUEST PORTAL
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Join Grand Palace and make your next stay
                effortless.
              </p>

            </div>

            {/* =================================================
                GOOGLE
            ================================================= */}

            <div className="google-register-wrapper">

              {googleLoading ? (

                <button
                  type="button"
                  className="google-login-button"
                  disabled
                >
                  <span className="auth-spinner dark" />
                  Connecting to Google...
                </button>

              ) : (

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width="455"
                />

              )}

            </div>

            {/* DIVIDER */}

            <div className="auth-divider">
              <span>
                OR REGISTER WITH EMAIL
              </span>
            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* =================================================
                ACCOUNT TYPE
            ================================================= */}

            <div className="auth-field">

              <label>
                Account Type
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "10px",
                  background: "#faf9f5",
                }}
              >

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0F3D3E",
                    color: "#C9A227",
                    flexShrink: 0,
                  }}
                >
                  <UserCheck size={20} />
                </div>

                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#0F3D3E",
                      fontSize: "15px",
                    }}
                  >
                    Guest / Customer
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "3px",
                      color: "#6B7280",
                      fontSize: "13px",
                    }}
                  >
                    Book rooms and manage your reservations
                  </span>
                </div>

              </div>

              <span
                style={{
                  display: "block",
                  marginTop: "7px",
                  fontSize: "12px",
                  color: "#6B7280",
                }}
              >
                Staff accounts are created by an administrator.
              </span>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="auth-field">

                <label htmlFor="name">
                  Full Name
                </label>

                <div className="auth-input-wrapper">

                  <UserRound
                    size={19}
                    className="auth-input-icon"
                  />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="auth-field">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">

                  <Mail
                    size={19}
                    className="auth-input-icon"
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="auth-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <LockKeyhole
                    size={19}
                    className="auth-input-icon"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
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

                <span className="password-hint">
                  Use at least 6 characters.
                </span>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="auth-field">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="auth-input-wrapper">

                  <LockKeyhole
                    size={19}
                    className="auth-input-icon"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={19} />
                  </>
                )}

              </button>

            </form>

            {/* SECURITY */}

            <div className="auth-security-note">

              <ShieldCheck size={18} />

              <span>
                Your information is protected with
                secure authentication.
              </span>

            </div>

            {/* LOGIN */}

            <div className="auth-switch">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* TERMS */}

            <p className="auth-terms">
              By creating an account, you agree to our
              Terms of Service and Privacy Policy.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Register;
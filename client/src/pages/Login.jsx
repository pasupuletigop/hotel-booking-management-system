import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    googleLogin,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
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
  // NORMAL LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: formData.email.trim(),
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
          "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    if (!credentialResponse?.credential) {
      setError(
        "Google authentication failed. Please try again."
      );
      return;
    }

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google authentication failed. Please try again."
    );
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

            <Link
              to="/"
              className="auth-brand"
            >
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
                WELCOME TO GRAND PALACE
              </span>

              <h1>
                Your stay begins
                <br />
                <em>with us.</em>
              </h1>

              <p>
                Experience exceptional hospitality,
                elegant rooms, and effortless booking
                at Grand Palace Hotel & Resort.
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
                Welcome back
              </h2>

              <p>
                Sign in to manage your reservations
                and continue your Grand Palace experience.
              </p>

            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <div className="google-register-wrapper">

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

            </div>

            {/* DIVIDER */}

            <div className="auth-divider">
              <span>
                OR CONTINUE WITH EMAIL
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
                FORM
            ================================================= */}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

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

                <div className="auth-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      window.alert(
                        "Password recovery will be added next."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>

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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              </div>

              {/* REMEMBER ME */}

              <div className="auth-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Remember me
                  </span>

                </label>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}

              </button>

            </form>

            {/* SECURITY */}

            <div className="auth-security-note">

              <ShieldCheck size={18} />

              <span>
                Your account information is protected
                with secure authentication.
              </span>

            </div>

            {/* REGISTER */}

            <div className="auth-switch">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create an account
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* TERMS */}

            <p className="auth-terms">
              By continuing, you agree to our
              Terms of Service and Privacy Policy.
            </p>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Login;
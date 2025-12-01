import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./loginPage.css";
import Modal from "../../../components/navigations/Modal"; // ensure you have a reusable modal

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onClose: null });

  const history = useHistory();

  const showModal = (title, message, onClose = null) => {
    setModal({ isOpen: true, title, message, onClose });
  };

  const closeModal = () => {
    if (modal.onClose) modal.onClose();
    setModal({ ...modal, isOpen: false, onClose: null });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://safesphere.duckdns.org/user-service/api/users/login",
        { email, password }
      );

      if (res.data.token) sessionStorage.setItem("token", res.data.token);
      const { token, ...user } = res.data;
      if (user && Object.keys(user).length > 0) {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      console.log(user)
      history.push("/");
    } catch (err) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      showModal("Login Failed", err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    showModal("Registration Info", "Please contact admin - 123-456-7890");
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setOtpSent(false);
    setForgotEmail("");
    setOtp("");
  };

  const sendOtp = async () => {
    if (!forgotEmail) return showModal("Error", "Please enter your email");
    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/forgot-password",
        { email: forgotEmail },
        { withCredentials: true }
      );
      setOtpSent(true);
      showModal("Success", "OTP sent to your email!");
    } catch (err) {
      showModal("Error", err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return showModal("Error", "Please enter OTP");
    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/verify-otp",
        { email: forgotEmail, otp },
        { withCredentials: true }
      );
      showModal("Success", "OTP verified! Redirecting to Change Password...", () =>
        history.push("/change-password?email=" + encodeURIComponent(forgotEmail))
      );
    } catch (err) {
      showModal("Error", err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">SAFESPHERE Login</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-extra">
          <button
            type="button"
            className="forgot-password-btn"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            className="register-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {showForgotPassword && (
          <div className="forgot-password-modal">
            <h3>Forgot Password</h3>
            {!otpSent ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={loading}
                />
                <button onClick={sendOtp} disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
                <button onClick={verifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1500,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 12 }}>{modal.title}</h3>
            <p style={{ marginBottom: 20 }}>{modal.message}</p>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

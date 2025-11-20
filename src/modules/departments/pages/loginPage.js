import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./loginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const history = useHistory();

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

      history.push("/");
    } catch (err) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    alert("Please contact admin - 123-456-7890");
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setOtpSent(false);
    setForgotEmail("");
    setOtp("");
  };

  const sendOtp = async () => {
    if (!forgotEmail) return alert("Please enter your email");
    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/forgot-password",
        { email: forgotEmail },
        { withCredentials: true } // ✅ important
      );
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("Please enter OTP");
    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/verify-otp",
        { email: forgotEmail, otp },
        { withCredentials: true } // ✅ important
      );
      alert("OTP verified! Redirecting to Change Password...");
      history.push("/change-password?email=" + encodeURIComponent(forgotEmail));
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP");
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
    </div>
  );
};

export default LoginPage;

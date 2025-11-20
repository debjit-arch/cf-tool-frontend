import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";

const ChangePasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    const emailParam = query.get("email");
    if (!emailParam) {
      alert("Email not provided!");
      history.push("/login");
    } else {
      setEmail(emailParam);
    }
  }, [query, history]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/reset-password",
        { email, newPassword }, // email from OTP flow
        { withCredentials: true } // optional if using session for OTP
      );

      alert("Password changed successfully! You can now login.");
      history.push("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

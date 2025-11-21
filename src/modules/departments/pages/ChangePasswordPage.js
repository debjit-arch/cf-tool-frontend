import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { Lock, Loader2 } from "lucide-react";

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
    if (newPassword !== confirmPassword)
      return alert("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/reset-password",
        { email, newPassword },
        { withCredentials: true }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-md">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Change Your Password
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter and confirm your new password
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-gray-700 font-medium">New Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-blue-500 outline-none transition"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-blue-500 outline-none transition"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 
                       rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

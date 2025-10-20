import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("reset_email");
  const otpVerified = localStorage.getItem("otp_verified");

  useEffect(() => {
    if (!email || otpVerified !== "true") {
      navigate("/forgot-password");
    }
  }, [email, otpVerified, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await api.post("/password/reset", { email, password, password_confirmation: confirm });
      setMessage("Password reset successful! Redirecting to login...");

      localStorage.removeItem("reset_email");
      localStorage.removeItem("otp_verified");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-3">Set New Password</h2>
        <p className="text-gray-600 mb-4">Enter and confirm your new password below.</p>

        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full mb-3 px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="border w-full mb-4 px-3 py-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

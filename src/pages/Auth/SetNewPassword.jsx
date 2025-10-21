import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import FormError from "../../components/FormError";
import handleApiError from "../../utils/handleApiError";

export default function SetNewPassword() {
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("reset_email");
  const otpVerified = localStorage.getItem("otp_verified");

  // Redirect if no email or OTP not verified
  useEffect(() => {
    if (!email || otpVerified !== "true") {
      navigate("/forgot-password");
    }
  }, [email, otpVerified, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.password_confirmation) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      await api.post("/password/reset", { email, ...form });

      setMessage("Password reset successful! Redirecting to login...");

      localStorage.removeItem("reset_email");
      localStorage.removeItem("otp_verified");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-3">Set New Password</h2>
        <p className="text-gray-600 mb-4">
          Enter and confirm your new password below.
        </p>

        <FormError error={error} />
        {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="password"
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={handleChange}
            className="border w-full mb-3 px-3 py-2 rounded"
            required
          />
          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirm password"
            value={form.password_confirmation}
            onChange={handleChange}
            className="border w-full mb-4 px-3 py-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

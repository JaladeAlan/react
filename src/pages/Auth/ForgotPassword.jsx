import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import FormError from "../../components/FormError";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await api.post("/password/reset/code", { email });

      setMessage(res.data.message || "A reset code has been sent to your email.");

      // Save email for next step
      localStorage.setItem("reset_email", email);

      // Navigate to OTP verification
      navigate("/reset-verify", { state: { email } });
    } catch (err) {
      handleApiError(err, setError, setFieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className={`border w-full px-3 py-2 rounded ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormError error={fieldErrors.email} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>

        <p className="text-center text-sm mt-4">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}

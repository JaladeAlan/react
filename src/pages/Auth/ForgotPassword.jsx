import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import FormError from "../../components/FormError";
import toast, { Toaster } from "react-hot-toast";

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

      const successMessage = res.data.message || "A reset code has been sent to your email.";
      setMessage(successMessage);
      toast.success(successMessage);

      // Save email for next step
      localStorage.setItem("reset_email", email);

      // Navigate to OTP verification
      setTimeout(() => {
        navigate("/reset-verify", { state: { email } });
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Failed to send reset code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Handle field errors if any
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 4000,
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
        }}
      />

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            GrowthApp
          </h1>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Icon Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              No worries! Enter your email and we'll send you a reset code.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>{message}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                className={`border w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                  fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <FormError error={fieldErrors.email} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Send Reset Code</span>
            )}
          </button>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function SetNewPassword() {
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("reset_email");
  const otpVerified = localStorage.getItem("otp_verified");

  // Redirect if no email or OTP not verified
  useEffect(() => {
    if (!email || otpVerified !== "true") {
      toast.error("Please complete the verification process first.");
      navigate("/forgot-password");
    }
  }, [email, otpVerified, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const passwordsMatch = form.password && form.password_confirmation && 
    form.password === form.password_confirmation;
  
  const passwordsDontMatch = form.password_confirmation && !passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.password_confirmation) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (form.password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);

      await api.post("/password/reset", { email, ...form });

      const successMsg = "Password reset successful! Redirecting to login...";
      setMessage(successMsg);
      toast.success(successMsg);

      localStorage.removeItem("reset_email");
      localStorage.removeItem("otp_verified");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
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
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* Icon Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Choose a strong password for your account
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-start gap-2">
              <CheckCircle size={18} className="mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="border border-gray-300 w-full pl-10 pr-12 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className={`border w-full pl-10 pr-12 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                    passwordsDontMatch ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {passwordsMatch && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                )}
              </div>
              {passwordsDontMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordsDontMatch}
              className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                loading || passwordsDontMatch
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
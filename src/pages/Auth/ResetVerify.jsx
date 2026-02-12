import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MailCheck, ArrowLeft, Loader2 } from "lucide-react";
import api from "../../utils/api";
import FormError from "../../components/FormError";
import handleApiError from "../../utils/handleApiError";
import toast, { Toaster } from "react-hot-toast";

export default function ResetVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("reset_email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Handle typing in OTP boxes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Allow backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Allow pasting entire code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(""));
      inputRefs.current[5].focus();
      toast.success("Code pasted successfully!");
    } else {
      toast.error("Please paste a valid 6-digit code");
    }
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const code = otp.join("");

    if (code.length < 6) {
      const msg = "Please enter all 6 digits of the code.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!email) {
      const msg = "Missing email. Please go back and re-enter your email.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await api.post("/password/reset/verify", {
        email,
        reset_code: code,
      });

      // Save verification state for next step
      localStorage.setItem("reset_email", email);
      localStorage.setItem("otp_verified", "true");

      const successMsg = "Verification successful! Redirecting...";
      setMessage(successMsg);
      toast.success(successMsg);
      
      setTimeout(() => navigate("/set-new-password"), 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Invalid or expired code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      const msg = "Missing email. Please go back and re-enter your email.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setResending(true);
    setMessage("");
    setError("");

    try {
      await api.post("/password/reset/code", { email });
      const successMsg = `A new code has been sent to ${email}. It expires in 10 minutes.`;
      setMessage(successMsg);
      toast.success("New code sent successfully!");
      
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Failed to resend code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResending(false);
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
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Icon Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Code</h2>
            <p className="text-sm text-gray-600 mt-2 text-center">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-gray-800">{email || "your email"}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Code expires in 10 minutes
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {message}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className={`font-semibold ${
                  resending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Use different email</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
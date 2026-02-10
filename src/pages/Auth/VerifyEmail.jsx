import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck, Loader2, ArrowLeft } from "lucide-react";
import api from "../../utils/api";
import FormError from "../../components/FormError";
import handleApiError from "../../utils/handleApiError";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("pending_email");

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);

      // Auto focus next input
      if (val && idx < otp.length - 1) {
        inputRefs.current[idx + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(""));
      inputRefs.current[5].focus();
    }
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      return setError("Please enter all 6 digits.");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/email/verify/code", { email, verification_code: code });
      setMessage("Email verified successfully!");
      localStorage.removeItem("pending_email");

      setTimeout(() => navigate("/email-verified"), 1500);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResend = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/email/resend-verification", { email });
      setMessage("Verification code sent!");
      setCooldown(60);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
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
              <MailCheck className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
            {email && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                We sent a 6-digit code to<br />
                <span className="font-semibold text-gray-800">{email}</span>
              </p>
            )}
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

          <form onSubmit={handleVerify}>
            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  autoFocus={idx === 0}
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
                <span>Verify Email</span>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className={`font-semibold ${
                  cooldown > 0 || loading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import OTPInput from "../../components/OTPInput";
import FormError from "../../components/FormError";
import handleApiError from "../../utils/handleApiError";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const email =
    location.state?.email || localStorage.getItem("pending_email");

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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

      setTimeout(() => navigate("/email-verified"), 1200);
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
      setMessage("Verification email resent!");
      setCooldown(30);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-3">Verify Your Email</h2>

        {email && (
          <p className="text-gray-600 mb-6">
            We sent you a code to{" "}
            <span className="font-medium text-blue-600">{email}</span>. <br />
            This code will expire <span className="font-medium">10 minutes</span> after this message.
          </p>
        )}

        {/* Error / Success Messages */}
        <FormError error={error} />
        {message && <p className="text-green-600 mb-2 text-sm">{message}</p>}

        <form onSubmit={handleVerify}>
          <OTPInput otp={otp} setOtp={setOtp} />

          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className={`text-sm ${
              cooldown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
          >
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

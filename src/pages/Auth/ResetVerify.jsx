import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import { Loader2, MailCheck } from "lucide-react";
import FormError from "../../components/FormError";
import handleApiError from "../../utils/handleApiError";

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

  //  Handle typing in OTP boxes
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

  //  Allow pasting entire code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(""));
      inputRefs.current[5].focus();
    }
  };

  //  Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const code = otp.join("");

    if (code.length < 6) {
      setError("Please enter all 6 digits of the code.");
      return;
    }

    if (!email) {
      setError("Missing email. Please go back and re-enter your email.");
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

      setMessage("Verification successful! Redirecting to password reset...");
      setTimeout(() => navigate("/set-new-password"), 1500);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  //  Resend OTP
  const handleResend = async () => {
    if (!email) {
      setError("Missing email. Please go back and re-enter your email.");
      return;
    }

    setResending(true);
    setMessage("");
    setError("");

    try {
      await api.post("/password/reset/code", { email });
      setMessage(`A new code has been sent to ${email}. It expires in 10 minutes.`);
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <MailCheck className="w-10 h-10 text-blue-600 mb-2" />
          <h2 className="text-xl font-semibold text-gray-700">Verify Code</h2>
          <p className="text-sm text-gray-500 mt-1 text-center">
            We sent a code to <strong>{email || "your email"}</strong>.<br />
            This code expires in 10 minutes.
          </p>
        </div>

        <FormError error={error} />
        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}

        <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
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
              className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify"}
        </button>

        <p className="text-center text-sm mt-4">
          Didn’t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:underline"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>
        </p>
      </form>
    </div>
  );
}

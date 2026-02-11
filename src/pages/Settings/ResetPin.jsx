import { useState, useEffect } from "react";
import api from "../../utils/api";
import PinInput from "../../components/PinInput";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPin() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const email = user?.email;

  useEffect(() => {
    if (!email) toast.error("User email not found. Please log in again.");
  }, [email]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await api.post("/pin/forgot", { email });
      toast.success("PIN reset code sent to your email.");
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Failed to send code.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await api.post("/pin/verify-code", { email, code });
      toast.success("✅ Code verified! Enter new PIN.");
      setStep(3);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Invalid code.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e) => {
    e.preventDefault();
    const newPin = pin.join("");
    const confirm = confirmPin.join("");

    if (newPin.length !== 4) {
      toast.error("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirm) {
      toast.error("PIN and confirmation PIN do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/pin/reset", { email, code, new_pin: newPin });
      toast.success("✅ Transaction PIN reset successfully!");
      setStep(1);
      setCode("");
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Reset failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
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

      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Reset Transaction PIN
      </h2>

      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <p className="text-gray-600">
            A reset code will be sent to your email: <b>{email}</b>
          </p>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code sent to email"
            required
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPin} className="space-y-4">
          <p className="text-center text-gray-600">Enter new 4-digit PIN:</p>
          <PinInput value={pin} onChange={setPin} touched={pin.some((d) => d !== "")} />
          <p className="text-center text-gray-600 mt-2">Confirm new PIN:</p>
          <PinInput value={confirmPin} onChange={setConfirmPin} touched={confirmPin.some((d) => d !== "")} />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset PIN"}
          </button>
        </form>
      )}
    </div>
  );
}
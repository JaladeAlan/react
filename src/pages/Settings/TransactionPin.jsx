import { useState, useEffect } from "react";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import toast, { Toaster } from "react-hot-toast";
import PinInput from "../../components/PinInput";

export default function TransactionPin() {
  const [hasPin, setHasPin] = useState(false);
  const [currentPin, setCurrentPin] = useState(["", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [touched, setTouched] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/me");
        setHasPin(!!res.data.user?.transaction_pin);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    })();
  }, []);

  const pinToString = (arr) => arr.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const newPinStr = pinToString(newPin);
    const confirmPinStr = pinToString(confirmPin);
    const currentPinStr = pinToString(currentPin);

    if (newPinStr.length !== 4 || confirmPinStr.length !== 4) {
      const msg = "PIN must contain exactly 4 digits.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPinStr !== confirmPinStr) {
      const msg = "New PIN and confirmation PIN do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      if (hasPin) {
        await api.post("/pin/update", {
          old_pin: currentPinStr,
          new_pin: newPinStr,
        });
        toast.success("Transaction PIN updated successfully ✅");
      } else {
        await api.post("/pin/set", { pin: newPinStr });
        toast.success("Transaction PIN set successfully 🎉");
        setHasPin(true);
      }

      setCurrentPin(["", "", "", ""]);
      setNewPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setTouched({ current: false, new: false, confirm: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Failed to update PIN";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      {/* Toast Container */}
      <Toaster
        position="top-center"
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
        {hasPin ? "Update Transaction PIN" : "Set Transaction PIN"}
      </h2>

      <form onSubmit={handleSubmit}>
        {hasPin && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Current PIN</label>
            <PinInput
              value={currentPin}
              onChange={setCurrentPin}
              touched={touched.current}
              setTouched={() => setTouched((prev) => ({ ...prev, current: true }))}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">New PIN</label>
          <PinInput
            value={newPin}
            onChange={setNewPin}
            touched={touched.new}
            setTouched={() => setTouched((prev) => ({ ...prev, new: true }))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Confirm New PIN</label>
          <PinInput
            value={confirmPin}
            onChange={setConfirmPin}
            touched={touched.confirm}
            setTouched={() => setTouched((prev) => ({ ...prev, confirm: true }))}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Processing..." : hasPin ? "Update PIN" : "Set PIN"}
        </button>
      </form>
    </div>
  );
}
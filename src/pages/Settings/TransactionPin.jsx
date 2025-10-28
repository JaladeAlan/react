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
      setError("PIN must contain exactly 4 digits.");
      return;
    }

    if (newPinStr !== confirmPinStr) {
      setError("New PIN and confirmation PIN do not match.");
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
      handleApiError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <Toaster position="top-center" />
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

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : hasPin ? "Update PIN" : "Set PIN"}
        </button>
      </form>
    </div>
  );
}

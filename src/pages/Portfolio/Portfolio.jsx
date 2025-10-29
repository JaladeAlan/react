import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import { toast } from "react-toastify";

export default function Portfolio() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  const [modal, setModal] = useState({ type: null, land: null, units: "", pin: "", processing: false });

  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Fetch user's portfolio & profile
  const fetchPortfolioAndUser = async () => {
    try {
      const [portfolioRes, userRes] = await Promise.all([
        api.get("/user/lands"),
        api.get("/me"),
      ]);

      const owned = (portfolioRes.data.owned_lands || []).filter(land => land.units_owned > 0);

      setLands(owned);
      setHasPin(!!userRes.data.user?.transaction_pin);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioAndUser();
  }, []);

  // Open modal
  const openModal = (type, land) => {
    if (!hasPin) {
      toast.warn("⚠️ Please create a transaction PIN before making transactions.");
      setTimeout(() => navigate("/settings"), 1500);
      return;
    }
    setModal({ type, land, units: "", pin: "", processing: false });
  };

  // Close modal
  const closeModal = () => {
    setModal({ type: null, land: null, units: "", pin: "", processing: false });
  };

  // Handle transaction submit
  const handleTransaction = async (e) => {
    e.preventDefault();

    const units = Number(modal.units);
    const pin = modal.pin.trim();

    if (!units || units <= 0) {
      toast.error("Enter a valid number of units.");
      return;
    }

    if (modal.type === "sell" && units > modal.land.units_owned) {
      toast.error("❌ You cannot sell more than you own.");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Enter your 4-digit PIN.");
      return;
    }

    setModal(prev => ({ ...prev, processing: true }));

    const endpoint =
      modal.type === "buy"
        ? `/lands/${modal.land.land_id}/purchase`
        : `/lands/${modal.land.land_id}/sell`;

    try {
      const res = await api.post(endpoint, { units, transaction_pin: pin });
      toast.success(res.data.message || `${modal.type} successful!`);
      await fetchPortfolioAndUser();
      closeModal();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error("Too many failed PIN attempts. Please try again later.");
      } else if (err.response?.status === 401) {
        toast.error(err.response.data.message || "Invalid PIN. Try again.");
      } else {
        handleApiError(err, (msg) => toast.error(msg));
      }
    } finally {
      setModal(prev => ({ ...prev, processing: false }));
    }
  };

  // Total payable/receivable
  const totalAmount = useMemo(() => {
    if (!modal.units || !modal.land) return 0;
    return Number(modal.units) * Number(modal.land.price_per_unit);
  }, [modal.units, modal.land]);

  // Handle modal focus trap & ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && modal.type) closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modal.type]);

  if (loading)
    return <p className="text-center text-gray-500">Loading portfolio...</p>;

  if (!lands.length)
    return <p className="text-center text-gray-600">You haven’t purchased any lands yet.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Portfolio</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {lands.map((land) => (
          <div
            key={land.land_id}
            className="p-5 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{land.land_name}</h2>
            <p className="text-gray-600 mt-1">
              Units Owned: <span className="font-medium">{land.units_owned}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Price per Unit: <span className="font-medium">₦{Number(land.price_per_unit).toLocaleString()}</span>
            </p>
            <p className="text-gray-600 mt-1">
              Current Value: <span className="font-semibold text-green-700">₦{Number(land.current_value).toLocaleString()}</span>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openModal("buy", land)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Buy More
              </button>
              <button
                onClick={() => openModal("sell", land)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sell Units
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.type && modal.land && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
          role="dialog"
          aria-modal="true"
          ref={modalRef}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 capitalize">
              {modal.type} Units - {modal.land.land_name}
            </h2>

            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="border p-3 rounded-lg bg-gray-50">
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Price per Unit:</span> ₦{Number(modal.land.price_per_unit).toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Units Owned:</span> {modal.land.units_owned}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Current Value:</span> ₦{Number(modal.land.current_value).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Number of Units</label>
                <input
                  type="number"
                  value={modal.units}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (modal.type === "sell" && val > modal.land.units_owned) return;
                    setModal(prev => ({ ...prev, units: e.target.value }));
                  }}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-100"
                  placeholder={`Enter units to ${modal.type}`}
                  min={1}
                  max={modal.type === "sell" ? modal.land.units_owned : undefined}
                  step={1}
                />
                {modal.type === "sell" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Max you can sell: {modal.land.units_owned}
                  </p>
                )}
              </div>

              {totalAmount > 0 && (
                <div className="text-gray-700 text-sm">
                  {modal.type === "buy" ? (
                    <p>
                      You’ll pay: <span className="font-semibold text-blue-700">₦{totalAmount.toLocaleString()}</span>
                    </p>
                  ) : (
                    <p>
                      You’ll receive: <span className="font-semibold text-green-700">₦{totalAmount.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">Transaction PIN</label>
                <input
                  type="password"
                  value={modal.pin}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    if (digitsOnly.length <= 4) setModal(prev => ({ ...prev, pin: digitsOnly }));
                  }}
                  maxLength={4}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-100"
                  placeholder="Enter your 4-digit PIN"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modal.processing || !modal.units || !modal.pin || modal.pin.length !== 4}
                  className={`px-4 py-2 rounded-lg text-white ${
                    modal.type === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  } disabled:opacity-50`}
                >
                  {modal.processing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

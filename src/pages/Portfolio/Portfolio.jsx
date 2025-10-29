import { useEffect, useState } from "react";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";
import { toast } from "react-toastify";

export default function Portfolio() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);

  const [modalType, setModalType] = useState(null);
  const [selectedLand, setSelectedLand] = useState(null);
  const [units, setUnits] = useState("");
  const [pin, setPin] = useState("");
  const [processing, setProcessing] = useState(false);

  // ✅ Fetch user's portfolio & profile
  const fetchPortfolioAndUser = async () => {
    try {
      const [portfolioRes, userRes] = await Promise.all([
        api.get("/user/lands"),
        api.get("/me"),
      ]);

      // Filter out lands with no units
      const owned = (portfolioRes.data.owned_lands || []).filter(
        (land) => land.units_owned > 0
      );

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

  // ✅ Open buy/sell modal
  const openTransaction = (type, land) => {
    if (!hasPin) {
      toast.warn("⚠️ Please create a transaction PIN before making transactions.");
      setTimeout(() => (window.location.href = "/settings"), 1500);
      return;
    }

    setModalType(type);
    setSelectedLand(land);
    setUnits("");
    setPin("");
  };

  // ✅ Handle transaction submit
  const handleTransaction = async (e) => {
    e.preventDefault();

    if (!units || Number(units) <= 0) {
      toast.error("Enter a valid number of units.");
      return;
    }

    if (modalType === "sell" && Number(units) > selectedLand.units_owned) {
      toast.error("❌ You cannot sell more than you own.");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Enter your 4-digit PIN.");
      return;
    }

    setProcessing(true);

    const endpoint =
      modalType === "buy"
        ? `/lands/${selectedLand.land_id}/purchase`
        : `/lands/${selectedLand.land_id}/sell`;

    try {
      const res = await api.post(endpoint, {
        units,
        transaction_pin: pin,
      });

      toast.success(res.data.message || `${modalType} successful!`);
      await fetchPortfolioAndUser(); // Refresh portfolio data

      setModalType(null);
      setUnits("");
      setPin("");
    } catch (err) {
      handleApiError(err);
      toast.error(
        err.response?.data?.message || "Transaction failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading portfolio...</p>;

  if (!lands.length)
    return (
      <p className="text-center text-gray-600">
        You haven’t purchased any lands yet.
      </p>
    );

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
              Units Owned:{" "}
              <span className="font-medium">{land.units_owned}</span>
            </p>

            <p className="text-gray-600 mt-1">
              Price per Unit:{" "}
              <span className="font-medium">
                ₦{Number(land.price_per_unit).toLocaleString()}
              </span>
            </p>

            <p className="text-gray-600 mt-1">
              Current Value:{" "}
              <span className="font-semibold text-green-700">
                ₦{Number(land.current_value).toLocaleString()}
              </span>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => openTransaction("buy", land)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Buy More
              </button>
              <button
                onClick={() => openTransaction("sell", land)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sell Units
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Modal */}
      {modalType && selectedLand && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 capitalize">
              {modalType} Units - {selectedLand.land_name}
            </h2>

            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="border p-3 rounded-lg bg-gray-50">
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Price per Unit:</span>{" "}
                  ₦{Number(selectedLand.price_per_unit).toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Units Owned:</span>{" "}
                  {selectedLand.units_owned}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Current Value:</span>{" "}
                  ₦{Number(selectedLand.current_value).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Number of Units</label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (modalType === "sell" && val > selectedLand.units_owned)
                      return;
                    setUnits(val);
                  }}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-100"
                  placeholder={`Enter units to ${modalType}`}
                  min={1}
                  max={modalType === "sell" ? selectedLand.units_owned : undefined}
                />
                {modalType === "sell" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Max you can sell: {selectedLand.units_owned}
                  </p>
                )}
              </div>

              {units > 0 && selectedLand.price_per_unit && (
                <div className="text-gray-700 text-sm">
                  {modalType === "buy" ? (
                    <p>
                      You’ll pay:{" "}
                      <span className="font-semibold text-blue-700">
                        ₦{(units * selectedLand.price_per_unit).toLocaleString()}
                      </span>
                    </p>
                  ) : (
                    <p>
                      You’ll receive:{" "}
                      <span className="font-semibold text-green-700">
                        ₦{(units * selectedLand.price_per_unit).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-1">
                  Transaction PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    if (digitsOnly.length <= 4) setPin(digitsOnly);
                  }}
                  maxLength={4}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-100"
                  placeholder="Enter your 4-digit PIN"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !units || !pin || pin.length !== 4}
                  className={`px-4 py-2 rounded-lg text-white ${
                    modalType === "buy"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } disabled:opacity-50`}
                >
                  {processing ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

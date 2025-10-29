import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import {
  purchaseLand,
  sellLand,
  getUserUnitsForLand,
} from "../../services/landService";

// Lightbox imports
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function LandDetails() {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [userUnits, setUserUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalType, setModalType] = useState(null);
  const [unitsInput, setUnitsInput] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [transactionPin, setTransactionPin] = useState("");

  // Lightbox state
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  // Fetch functions
  const fetchLand = useCallback(async () => {
    try {
      const res = await api.get(`/lands/${id}`);
      setLand(res.data);
    } catch (err) {
      console.error("Error fetching land:", err);
      setError("Unable to load land details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserUnits = useCallback(async () => {
    try {
      const res = await getUserUnitsForLand(id);
      if (res.units_owned !== undefined) setUserUnits(res.units_owned);
    } catch (err) {
      console.error("Error fetching user units:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchLand();
    fetchUserUnits();
  }, [fetchLand, fetchUserUnits]);

  // Handle purchase/sell
  const handleAction = async () => {
    const units = Number(unitsInput);
    if (!units || isNaN(units) || units <= 0) {
      setModalError("Please enter a valid number of units.");
      return;
    }

    if (!/^\d{4}$/.test(transactionPin)) {
      setModalError("Transaction PIN must be a 4-digit number.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      let res;
      if (modalType === "purchase") {
        res = await purchaseLand(id, units, transactionPin);
        alert(`✅ Purchase successful!\nReference: ${res.reference}`);
      } else if (modalType === "sell") {
        res = await sellLand(id, units, transactionPin);
        alert(`✅ Sold successfully!\nReference: ${res.reference}`);
      }

      // Re-fetch state instead of full reload
      await fetchLand();
      await fetchUserUnits();

      // Reset modal inputs
      setModalType(null);
      setUnitsInput("");
      setTransactionPin("");
    } catch (err) {
      console.error("Transaction error:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Transaction failed. Please try again."
      );
    } finally {
      setModalLoading(false);
    }
  };

  // UI states
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading land details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!land)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">No land found.</p>
      </div>
    );

  const images =
    land.images?.map((img) => ({
      src: `${BASE_URL}/storage/${img.image_path}`,
    })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        to="/dashboard"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* IMAGE GALLERY */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.src}
                alt={`${land.title} ${i + 1}`}
                onClick={() => {
                  setPhotoIndex(i);
                  setOpen(true);
                }}
                className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
              />
            ))}
          </div>
        ) : (
          <img
            src="/no-image.jpg"
            alt="No Image"
            className="w-full h-64 object-cover"
          />
        )}

        {/* LAND DETAILS */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {land.title}
          </h1>
          <p className="text-gray-600 mb-2">{land.location}</p>

          <div className="text-gray-700 space-y-1 mb-4">
            <p>
              <span className="font-medium">Size:</span> {land.size} sq ft
            </p>
            <p>
              <span className="font-medium">Price per unit:</span> ₦
              {Number(land.price_per_unit).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Available Units:</span>{" "}
              {land.available_units}
            </p>
            <p>
              <span className="font-medium">Total Units:</span>{" "}
              {land.total_units}
            </p>
            <p>
              <span className="font-medium">Your Units:</span>{" "}
              {userUnits ?? 0}
            </p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            {land.description || "No description available."}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={() => setModalType("purchase")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Purchase Units
            </button>

            {userUnits > 0 && (
              <button
                onClick={() => setModalType("sell")}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Sell Units
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={photoIndex}
          slides={images}
          plugins={images.length > 1 ? [Thumbnails] : []}
        />
      )}

      {/* MODAL */}
     {modalType && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-96">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 capitalize">
            {modalType === "purchase" ? "Purchase Units" : "Sell Units"}
          </h2>

          {/* ✅ Units Input */}
          <label className="block text-gray-700 mb-1">Number of Units</label>
          <input
            type="number"
            min="1"
            max={modalType === "sell" ? userUnits : land.available_units}
            value={unitsInput}
            onChange={(e) => {
              let value = e.target.value;
              if (modalType === "sell" && Number(value) > userUnits) {
                value = userUnits; // cap at owned units
              }
              if (modalType === "purchase" && Number(value) > land.available_units) {
                value = land.available_units; // cap at available
              }
              setUnitsInput(value);
            }}
            placeholder={`Enter number of units to ${modalType}`}
            className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-300"
          />
          {modalType === "sell" && (
            <p className="text-sm text-gray-500 mb-2">
              You own: <strong>{userUnits}</strong> units
            </p>
          )}
          {modalType === "purchase" && (
            <p className="text-sm text-gray-500 mb-2">
              Available: <strong>{land.available_units}</strong> units
            </p>
          )}

          {/* ✅ Transaction PIN Input */}
          <label className="block text-gray-700 mb-1">Transaction PIN</label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={transactionPin}
            onChange={(e) => {
              // allow only 4 digits
              const digitsOnly = e.target.value.replace(/\D/g, "");
              if (digitsOnly.length <= 4) setTransactionPin(digitsOnly);
            }}
            placeholder="Enter your 4-digit PIN"
            className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-300"
          />

          {modalError && (
            <p className="text-red-600 text-sm mb-3">{modalError}</p>
          )}

          {/* ✅ Estimated total */}
          {unitsInput > 0 && (
            <p className="text-gray-700 text-sm mb-3">
              {modalType === "purchase" ? (
                <>
                  You’ll pay:{" "}
                  <span className="font-semibold text-blue-700">
                    ₦{(unitsInput * land.price_per_unit).toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  You’ll receive:{" "}
                  <span className="font-semibold text-green-700">
                    ₦{(unitsInput * land.price_per_unit).toLocaleString()}
                  </span>
                </>
              )}
            </p>
          )}

          {/* ✅ Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                if (modalLoading) return;
                setModalType(null);
                setModalError("");
                setUnitsInput("");
                setTransactionPin("");
              }}
              disabled={modalLoading}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleAction}
              disabled={modalLoading}
              className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
                modalType === "purchase"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-500 hover:bg-yellow-600"
              } disabled:opacity-50`}
            >
              {modalLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}

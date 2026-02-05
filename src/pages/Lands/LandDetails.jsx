import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import {
  purchaseLand,
  sellLand,
  getUserUnitsForLand,
} from "../../services/landService";
import { getLandImage } from "../../utils/images";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Toast
import toast, { Toaster } from "react-hot-toast";

/* ================= MONEY HELPERS ================= */

const koboToNaira = (kobo) => Number(kobo) / 100;

const formatNaira = (kobo) =>
  koboToNaira(kobo).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ================= COMPONENT ================= */

export default function LandDetails() {
  const { id } = useParams();

  const [land, setLand] = useState(null);
  const [userUnits, setUserUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalType, setModalType] = useState(null);
  const [unitsInput, setUnitsInput] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Lightbox
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  /* ================= DATA ================= */

  const fetchLand = useCallback(async () => {
    try {
      const res = await api.get(`/lands/${id}`);
      setLand(res.data.data);
    } catch {
      setError("Unable to load land details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserUnits = useCallback(async () => {
    try {
      const res = await getUserUnitsForLand(id);
      if (res.units_owned !== undefined) {
        setUserUnits(res.units_owned);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchLand();
    fetchUserUnits();
  }, [fetchLand, fetchUserUnits]);

  /* ================= ACTION ================= */

  const handleAction = async () => {
    const units = Number(unitsInput);

    if (!units || units <= 0) {
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
        toast.success(`Purchase successful! Ref: ${res.reference}`);
      } else {
        res = await sellLand(id, units, transactionPin);
        toast.success(`Sold successfully! Ref: ${res.reference}`);
      }

      await fetchLand();
      await fetchUserUnits();

      setModalType(null);
      setUnitsInput("");
      setTransactionPin("");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Transaction failed. Try again.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  /* ================= STATES ================= */

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

  /* ================= IMAGES ================= */

  const images = land.images?.length
    ? land.images.map((img) => ({ src: img.url }))
    : [{ src: getLandImage(land) }];

  const totalKobo = unitsInput
    ? Number(unitsInput) * land.price_per_unit_kobo
    : 0;

  /* ================= RENDER ================= */

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Toaster position="top-right" />

      <Link to="/lands" className="text-blue-600 hover:underline">
        ← Back to Lands
      </Link>

      <div className="bg-white shadow rounded-xl overflow-hidden mt-6">
        {/* Images */}
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
              className="w-full h-64 object-cover rounded-lg cursor-pointer"
            />
          ))}
        </div>

        {/* Details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold">{land.title}</h1>
          <p className="text-gray-600">{land.location}</p>

          <div className="mt-4 space-y-1 text-gray-700">
            <p><strong>Size:</strong> {land.size} sq ft</p>
            <p><strong>Price per unit:</strong> {formatNaira(land.price_per_unit_kobo)}</p>
            <p><strong>Available Units:</strong> {land.available_units}</p>
            <p><strong>Total Units:</strong> {land.total_units}</p>
            <p><strong>Your Units:</strong> {userUnits}</p>
          </div>

          <p className="mt-5 text-gray-700">
            {land.description || "No description available."}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setModalType("purchase")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Purchase Units
            </button>

            {userUnits > 0 && (
              <button
                onClick={() => setModalType("sell")}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
              >
                Sell Units
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={photoIndex}
          slides={images}
          plugins={images.length > 1 ? [Thumbnails] : []}
        />
      )}

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-semibold mb-4 capitalize">
              {modalType} Units
            </h2>

            <input
              type="number"
              min="1"
              max={modalType === "sell" ? userUnits : land.available_units}
              value={unitsInput}
              onChange={(e) => setUnitsInput(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Number of units"
            />

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={transactionPin}
              onChange={(e) =>
                setTransactionPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="4-digit PIN"
            />

            {unitsInput > 0 && (
              <p className="text-sm mb-3">
                {modalType === "purchase" ? "You’ll pay:" : "You’ll receive:"}{" "}
                <strong>{formatNaira(totalKobo)}</strong>
              </p>
            )}

            {modalError && (
              <p className="text-red-600 text-sm mb-3">{modalError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAction}
                disabled={modalLoading}
                className={`px-4 py-2 rounded text-white ${
                  modalType === "purchase"
                    ? "bg-green-600"
                    : "bg-yellow-500"
                }`}
              >
                {modalLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

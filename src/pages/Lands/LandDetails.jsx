import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const [land, setLand] = useState(null);
  const [userUnits, setUserUnits] = useState(0);
  const [user, setUser] = useState(null); // store user info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalType, setModalType] = useState(null);
  const [unitsInput, setUnitsInput] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Dedicated PIN-not-set modal
  const [pinNotSet, setPinNotSet] = useState(false);

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

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data.user);

      if (!res.data.user.transaction_pin) {
        setPinNotSet(true); // show modal immediately if PIN not set
      }
    } catch (err) {
      console.error("Unable to fetch user info", err);
    }
  }, []);

  useEffect(() => {
    fetchLand();
    fetchUserUnits();
    fetchUser();
  }, [fetchLand, fetchUserUnits, fetchUser]);

  /* ================= ACTION ================= */
  const handleAction = async () => {
    const units = Number(unitsInput);

    if (!units || units <= 0) {
      const msg = "Please enter a valid number of units.";
      setModalError(msg);
      toast.error(msg);
      return;
    }

    if (!/^\d{4}$/.test(transactionPin)) {
      const msg = "Transaction PIN must be a 4-digit number.";
      setModalError(msg);
      toast.error(msg);
      return;
    }

    setModalLoading(true);
    setModalError(null);

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
      const apiMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message;

      // fallback PIN-not-set handling
      if (apiMessage?.toLowerCase().includes("pin not set")) {
        setPinNotSet(true);
        setModalType(null);
        return;
      }

      const fallback = "Transaction failed. Try again.";
      const errorMessage = apiMessage || fallback;
      setModalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading land details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Link to="/lands" className="text-blue-600 hover:underline">
            ← Back to Lands
          </Link>
        </div>
      </div>
    );

  if (!land)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No land found.</p>
          <Link to="/lands" className="text-blue-600 hover:underline">
            ← Back to Lands
          </Link>
        </div>
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

      <Link to="/lands" className="text-blue-600 hover:underline text-sm">
        ← Back to Lands
      </Link>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden mt-6">
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
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            />
          ))}
        </div>

        {/* Details */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">{land.title}</h1>
          <p className="text-gray-600 text-lg mt-1">{land.location}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Size</p>
              <p className="text-lg font-semibold text-gray-900">{land.size} sq ft</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Price per unit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatNaira(land.price_per_unit_kobo)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Available Units</p>
              <p className="text-lg font-semibold text-gray-900">{land.available_units}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-lg font-semibold text-gray-900">{land.total_units}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Your Units</p>
              <p className="text-lg font-bold text-blue-700">{userUnits}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {land.description || "No description available."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setModalType("purchase")}
              disabled={!user?.transaction_pin}
              className={`bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all ${
                !user?.transaction_pin ? "opacity-50 cursor-not-allowed" : "shadow-lg hover:shadow-xl"
              }`}
            >
              Purchase Units
            </button>

            {userUnits > 0 && (
              <button
                onClick={() => setModalType("sell")}
                disabled={!user?.transaction_pin}
                className={`bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all ${
                  !user?.transaction_pin ? "opacity-50 cursor-not-allowed" : "shadow-lg hover:shadow-xl"
                }`}
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

      {/* Purchase/Sell Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 capitalize text-gray-900">
              {modalType} Units - {land.title}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Units
                </label>
                <input
                  type="number"
                  min="1"
                  max={modalType === "sell" ? userUnits : land.available_units}
                  value={unitsInput}
                  onChange={(e) => setUnitsInput(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder={`Max: ${modalType === "sell" ? userUnits : land.available_units}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={transactionPin}
                  onChange={(e) =>
                    setTransactionPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-xl tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="••••"
                />
              </div>

              {unitsInput > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    {modalType === "purchase" ? "Total Amount to Pay" : "Amount You'll Receive"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNaira(totalKobo)}
                  </p>
                </div>
              )}

              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {modalError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setModalType(null);
                  setUnitsInput("");
                  setTransactionPin("");
                  setModalError(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleAction}
                disabled={modalLoading || !unitsInput || !transactionPin}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all ${
                  modalType === "purchase"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {modalLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Not Set Modal */}
      {pinNotSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Transaction PIN Required
              </h2>
            </div>

            <p className="text-gray-600 text-center mb-6">
              You need to set a transaction PIN before you can buy or sell land units.
            </p>

            <div className="space-y-3">
              <Link
                to="/settings"
                state={{ returnTo: location.pathname }}
                className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Set Transaction PIN
              </Link>

              <button
                onClick={() => setPinNotSet(false)}
                className="w-full text-gray-700 px-4 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
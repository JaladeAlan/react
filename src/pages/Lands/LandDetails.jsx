import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import {
  purchaseLand,
  sellLand,
  getUserUnitsForLand,
} from "../../services/landService";

export default function LandDetails() {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [userUnits, setUserUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState(null); // 'purchase' or 'sell'
  const [unitsInput, setUnitsInput] = useState("");

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await api.get(`/lands/${id}`);
        setLand(res.data);
      } catch (err) {
        console.error("Error fetching land:", err);
        setError("Unable to load land details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserUnits = async () => {
      try {
        const res = await getUserUnitsForLand(id);
        if (res.units_owned !== undefined) setUserUnits(res.units_owned);
      } catch (err) {
        console.error("Error fetching user units:", err);
      }
    };

    fetchLand();
    fetchUserUnits();
  }, [id]);

  const handleAction = async () => {
    if (!unitsInput || isNaN(unitsInput) || unitsInput <= 0) {
      alert("Please enter a valid number of units.");
      return;
    }

    try {
      if (modalType === "purchase") {
        const res = await purchaseLand(id, unitsInput);
        alert(`✅ Purchase successful!\nReference: ${res.reference}`);
      } else if (modalType === "sell") {
        const res = await sellLand(id, unitsInput);
        alert(`✅ Sold successfully!\nReference: ${res.reference}`);
      }
      setModalType(null);
      setUnitsInput("");
      window.location.reload();
    } catch (err) {
      alert(err.message || "Transaction failed. Please try again.");
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        to="/dashboard"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* Image section */}
        {land.images && land.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {land.images.map((img, i) => (
              <img
                key={i}
                src={`${BASE_URL}/storage/${img.image_path}`}
                alt={`${land.title} ${i + 1}`}
                className="w-full h-64 object-cover rounded-lg"
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

        {/* Land details */}
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

          <p className="text-gray-700 leading-relaxed">
            {land.description || "No description available."}
          </p>

          <div className="mt-6 flex gap-3">
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

      {/* Modal for Purchase/Sell */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 capitalize">
              {modalType} Units
            </h2>

            <input
              type="number"
              value={unitsInput}
              onChange={(e) => setUnitsInput(e.target.value)}
              placeholder="Enter number of units"
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring focus:ring-blue-300"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  modalType === "purchase"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

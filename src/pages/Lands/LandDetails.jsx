import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function LandDetails() {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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
    fetchLand();
  }, [id]);

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
          </div>

          <p className="text-gray-700 leading-relaxed">
            {land.description || "No description available."}
          </p>

          <div className="mt-6">
            <button
              onClick={() => alert("Purchase feature coming soon")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Purchase Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

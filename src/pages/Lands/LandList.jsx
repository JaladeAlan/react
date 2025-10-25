import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function Lands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await api.get("/lands");
        setLands(res.data);
      } catch (err) {
        console.error("Error fetching lands:", err);
        setError("Failed to load lands. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading lands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Available Lands
      </h2>

      {lands.length === 0 ? (
        <p className="text-gray-500">No lands available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {lands.map((land) => {
            const imageUrl =
              land.images?.length > 0
                ? `${BASE_URL}/storage/${land.images[0].image_path}`
                : "/no-image.jpeg"; // fallback placeholder

            return (
              <div
                key={land.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <img
                  src={imageUrl}
                  alt={land.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.src = "/no-image.jpg")}
                />

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {land.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{land.location}</p>

                  <div className="text-sm text-gray-700 mb-3 flex flex-col gap-1">
                    <p>
                      <span className="font-medium">Size:</span> {land.size} sq ft
                    </p>
                    <p>
                      <span className="font-medium">Price:</span> ₦
                      {Number(land.price_per_unit).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Available Units:</span>{" "}
                      {land.available_units}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`/lands/${land.id}`}
                      className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function AdminLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLands = async () => {
    try {
      const res = await api.get("/lands");
      setLands(res.data);
    } catch {
      toast.error("Failed to load lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const toggleLand = async (id, enabled) => {
    try {
      await api.patch(`/admin/lands/${id}/${enabled ? "disable" : "enable"}`);
      toast.success(`Land ${enabled ? "disabled" : "enabled"}`);
      fetchLands();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Manage Lands</h1>
        <Link
          to="/admin/lands/create"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Land
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lands.map(land => (
              <tr key={land.id} className="border-t">
                <td className="p-3">{land.title}</td>
                <td>{land.location}</td>
                <td>₦{land.price_per_unit}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      land.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {land.is_available ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="text-right space-x-2">
                  <Link
                    to={`/admin/lands/${land.id}/edit`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleLand(land.id, land.is_available)}
                    className="text-red-600"
                  >
                    {land.is_available ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {lands.map(land => (
          <div key={land.id} className="border p-3 rounded">
            <h2 className="font-semibold">{land.title}</h2>
            <p className="text-sm">{land.location}</p>
            <p className="text-sm">₦{land.price_per_unit}</p>

            <div className="flex justify-between mt-3">
              <Link
                to={`/admin/lands/${land.id}/edit`}
                className="text-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={() => toggleLand(land.id, land.is_available)}
                className="text-red-600"
              >
                {land.is_available ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

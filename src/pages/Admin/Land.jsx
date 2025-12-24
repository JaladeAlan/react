import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function AdminLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLands = async () => {
    try {
      const res = await api.get("/lands/admin/show");
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
      await api.patch(`/lands/admin/${id}/${enabled ? "disable" : "enable"}`);
      toast.success(`Land ${enabled ? "disabled" : "enabled"}`);
      fetchLands();
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-semibold">Manage Lands</h1>
        <Link
          to="/admin/lands/create"
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          + Add Land
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-medium text-gray-700">Title</th>
              <th className="p-3 text-left font-medium text-gray-700">Location</th>
              <th className="p-3 text-left font-medium text-gray-700">Price</th>
              <th className="p-3 text-left font-medium text-gray-700">Total Units</th>
              <th className="p-3 text-left font-medium text-gray-700">Available Units</th>
              <th className="p-3 text-left font-medium text-gray-700">Status</th>
              <th className="p-3 text-right font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lands.map((land) => (
              <tr key={land.id}>
                <td className="p-3">{land.title}</td>
                <td className="p-3">{land.location}</td>
                <td className="p-3">₦{Number(land.price_per_unit).toLocaleString()}</td>
                <td className="p-3">{land.total_units}</td>
                <td className="p-3">{land.available_units}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      land.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {land.is_available ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <Link
                    to={`/admin/lands/${land.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleLand(land.id, land.is_available)}
                    className="text-red-600 hover:underline"
                  >
                    {land.is_available ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {lands.map((land) => (
          <div key={land.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{land.title}</h2>
            <p className="text-gray-500">{land.location}</p>
            <p className="text-gray-700">Price: ₦{Number(land.price_per_unit).toLocaleString()}</p>
            <p className="text-gray-700">
              Total Units: {land.total_units} | Available: {land.available_units}
            </p>
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                land.is_available
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {land.is_available ? "Active" : "Disabled"}
            </span>
            <div className="flex justify-between mt-3">
              <Link
                to={`/admin/lands/${land.id}/edit`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => toggleLand(land.id, land.is_available)}
                className="text-red-600 hover:underline"
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

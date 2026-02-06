import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

const koboToNaira = (kobo) => Number(kobo) / 100;

const nairaToKobo = (naira) => Math.round(Number(naira) * 100);

const formatNaira = (kobo) =>
  koboToNaira(kobo).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [priceDate, setPriceDate] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchLands = async () => {
    try {
      const res = await api.get("/lands/admin/show");
      setLands(res.data.data);
    } catch (error) {
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
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const openPriceModal = (land) => {
    setSelectedLand(land);
    setNewPrice(koboToNaira(land.price_per_unit_kobo));
    setPriceDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || !priceDate) {
      toast.error("Price and date are required");
      return;
    }

    try {
      setUpdating(true);

      await api.patch(`/lands/admin/${selectedLand.id}/price`, {
        price_per_unit_kobo: nairaToKobo(newPrice),
        price_date: priceDate,
      });

      toast.success("Price updated successfully");
      setShowModal(false);
      fetchLands();
    } catch (error) {
      toast.error("Failed to update price");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-semibold">Manage Lands</h1>
        <Link
          to="/admin/lands/create"
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          + Add Land
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Units</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {lands.map((land) => (
              <tr key={land.id}>
                <td className="p-3">{land.title}</td>
                <td className="p-3">{land.location}</td>
                <td className="p-3">
                  {formatNaira(land.price_per_unit_kobo)}
                </td>
                <td className="p-3">
                  {land.available_units}/{land.total_units}
                </td>
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
                    onClick={() => openPriceModal(land)}
                    className="text-purple-600 hover:underline"
                  >
                    Update Price
                  </button>

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

      {/* ================= PRICE MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Update Price - {selectedLand.title}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Price (₦)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Price Date</label>
                <input
                  type="date"
                  value={priceDate}
                  onChange={(e) => setPriceDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5 space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdatePrice}
                disabled={updating}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function CreateLand() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    size: "",
    price_per_unit: "",
    total_units: "",
    lat: "",
    lng: "",
    description: "",
    is_available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      return;
    }

    if (
      ["size", "price_per_unit", "total_units", "lat", "lng"].includes(name)
    ) {
      if (!/^-?\d*\.?\d*$/.test(value)) return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.location) {
      return toast.error("Title and location are required");
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        data.append(key, key === "is_available" ? (value ? 1 : 0) : value);
      }
    });

    images.forEach((img) => data.append("images[]", img));

    try {
      setLoading(true);
      await api.post("/lands/admin/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Land created successfully");

      setForm({
        title: "",
        location: "",
        size: "",
        price_per_unit: "",
        total_units: "",
        lat: "",
        lng: "",
        description: "",
        is_available: true,
      });
      setImages([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create land");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create Land</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/lands")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Lands
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Land Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              name="lat"
              value={form.lat}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              name="lng"
              value={form.lng}
              onChange={handleChange}
              className="w-full p-3 border rounded"
            />
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-1">Size (sqm)</label>
          <input
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Price per Unit
          </label>
          <input
            name="price_per_unit"
            value={form.price_per_unit}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Units */}
        <div>
          <label className="block text-sm font-medium mb-1">Total Units</label>
          <input
            name="total_units"
            value={form.total_units}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm font-medium">
            Available for purchase
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Land Images
          </label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>

        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Creating..." : "Create Land"}
        </button>
      </form>
    </div>
  );
}

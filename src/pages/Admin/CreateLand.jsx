import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";

export default function CreateLand() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    size: "",
    price_per_unit: "",
    total_units: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    Object.keys(form).forEach((key) => data.append(key, form[key]));
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
        description: "",
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
      <h1 className="text-2xl font-semibold mb-6">Create Land</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Land Title</label>
          <input
            name="title"
            type="text"
            className="w-full p-3 border rounded"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Location</label>
          <input
            name="location"
            type="text"
            className="w-full p-3 border rounded"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        {/* Size */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Size (sqm)</label>
          <input
            name="size"
            type="number"
            className="w-full p-3 border rounded"
            value={form.size}
            onChange={handleChange}
          />
        </div>

        {/* Price per Unit */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Price per Unit</label>
          <input
            name="price_per_unit"
            type="number"
            className="w-full p-3 border rounded"
            value={form.price_per_unit}
            onChange={handleChange}
          />
        </div>

        {/* Total Units */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Total Units</label>
          <input
            name="total_units"
            type="number"
            className="w-full p-3 border rounded"
            value={form.total_units}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows="4"
            className="w-full p-3 border rounded"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
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

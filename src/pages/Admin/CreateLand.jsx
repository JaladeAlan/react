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
    lat: "",
    lng: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow numeric + decimals for coords & numbers
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
        data.append(key, value);
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
        <input
          name="title"
          placeholder="Land Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="lat"
            placeholder="Latitude (e.g. 6.524379)"
            value={form.lat}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
          <input
            name="lng"
            placeholder="Longitude (e.g. 3.379206)"
            value={form.lng}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        <input
          name="size"
          placeholder="Size (sqm)"
          value={form.size}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          name="price_per_unit"
          placeholder="Price per unit"
          value={form.price_per_unit}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input
          name="total_units"
          placeholder="Total units"
          value={form.total_units}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 border rounded"
        />

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

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

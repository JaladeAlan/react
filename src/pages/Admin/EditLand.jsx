import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function EditLand() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    size: "",
    price_per_unit_kobo: "",
    total_units: "",
    lat: "",
    lng: "",
    is_available: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soldUnits, setSoldUnits] = useState(0);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await api.get(`/lands/${id}`);
        const land = res.data;

        setForm({
          title: land.title || "",
          location: land.location || "",
          description: land.description || "",
          size: land.size?.toString() || "",
          price_per_unit_kobo: land.price_per_unit_kobo?.toString() || "",
          total_units: land.total_units?.toString() || "",
          lat: land.lat?.toString() || "",
          lng: land.lng?.toString() || "",
          is_available: land.is_available ?? true,
        });

        setSoldUnits(land.total_units - land.available_units);
        setExistingImages(land.images || []);
      } catch {
        toast.error("Failed to load land");
      }
    };

    fetchLand();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      ["size", "price_per_unit_kobo", "total_units", "lat", "lng"].includes(name)
    ) {
      if (!/^-?\d*\.?\d*$/.test(value)) return;
    }

    if (name === "total_units" && value !== "") {
      if (parseInt(value) < soldUnits) {
        toast.error(`Cannot be less than sold units (${soldUnits})`);
        return;
      }
    }

    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const removeExistingImage = (id) => {
    setRemoveImages((prev) => [...prev, id]);
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        data.append(key, key === "is_available" ? (value ? 1 : 0) : value);
      }
    });

    newImages.forEach((img) => data.append("images[]", img));
    removeImages.forEach((id) => data.append("remove_images[]", id));

    try {
      setLoading(true);
      await api.post(`/lands/admin/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Land updated");
      navigate("/admin/lands");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Edit Land</h1>
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
          <label className="block mb-1 font-medium">Title</label>
          <input
            name="title"
            placeholder="Land title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            name="location"
            placeholder="City / Area"
            value={form.location}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Latitude</label>
            <input
              name="lat"
              placeholder="e.g. 6.5244"
              value={form.lat}
              onChange={handleChange}
              className="p-3 border rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Longitude</label>
            <input
              name="lng"
              placeholder="e.g. 3.3792"
              value={form.lng}
              onChange={handleChange}
              className="p-3 border rounded w-full"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            placeholder="Land description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Numbers */}
        <div>
          <label className="block mb-1 font-medium">Land Size</label>
          <input
            name="size"
            placeholder="e.g. 500 sqm"
            value={form.size}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Price Per Unit</label>
          <input
            name="price_per_unit_kobo"
            placeholder="e.g. 150000"
            value={form.price_per_unit_kobo}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Total Units</label>
          <input
            name="total_units"
            placeholder="Total plots available"
            value={form.total_units}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Sold units: {soldUnits}
          </p>
        </div>

        {/* Availability */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
          />
          <span>Available for Sale</span>
        </label>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={img.url}
                  alt=""
                  className="h-32 w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block mb-1 font-medium">Add New Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}

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
    price_per_unit: "",
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
          price_per_unit: land.price_per_unit?.toString() || "",
          total_units: land.total_units?.toString() || "",
          lat: land.lat?.toString() || "",
          lng: land.lng?.toString() || "",
          is_available: land.is_available ?? true,
        });

        setSoldUnits(
          land.total_units - land.available_units
        );

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
      ["size", "price_per_unit", "total_units", "lat", "lng"].includes(name)
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
      <h1 className="text-xl font-semibold mb-4">Edit Land</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} className="w-full p-3 border rounded" />
        <input name="location" value={form.location} onChange={handleChange} className="w-full p-3 border rounded" />

        <div className="grid grid-cols-2 gap-4">
          <input name="lat" placeholder="Latitude" value={form.lat} onChange={handleChange} className="p-3 border rounded" />
          <input name="lng" placeholder="Longitude" value={form.lng} onChange={handleChange} className="p-3 border rounded" />
        </div>

        <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-3 border rounded" />

        <input name="size" value={form.size} onChange={handleChange} className="w-full p-3 border rounded" />
        <input name="price_per_unit" value={form.price_per_unit} onChange={handleChange} className="w-full p-3 border rounded" />
        <input name="total_units" value={form.total_units} onChange={handleChange} className="w-full p-3 border rounded" />

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} />
          <span>Available</span>
        </label>

        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img src={img.image_path} alt="" className="h-32 w-full object-cover rounded" />
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

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

        <button disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded w-full">
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}

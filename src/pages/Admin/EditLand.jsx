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
    is_available: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Fetch land data */
  useEffect(() => {
    api.get(`/lands/${id}`).then(res => {
      const land = res.data;

      setForm({
        title: land.title || "",
        location: land.location || "",
        description: land.description || "",
        size: land.size !== null ? land.size.toString() : "",
        price_per_unit: land.price_per_unit !== null ? land.price_per_unit.toString() : "",
        total_units: land.total_units !== null ? land.total_units.toString() : "",
        is_available: land.is_available ?? true,
      });

      // Ensure each image has full URL
      const imagesWithUrl = (land.images || []).map(img => ({
        ...img,
        image_url: img.image_url || img.image_path, // fallback if image_url missing
      }));

      setExistingImages(imagesWithUrl);
    });
  }, [id]);

  /** Handle text / checkbox changes */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /** Handle new image selection */
  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  /** Mark existing image for removal */
  const removeExistingImage = (imgId) => {
    setRemoveImages(prev => [...prev, imgId]);
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
  };

  /** Submit form */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // Append land fields with proper casting
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        if (["size", "price_per_unit"].includes(key)) {
          data.append(key, parseFloat(value));
        } else if (["total_units"].includes(key)) {
          data.append(key, parseInt(value));
        } else if (key === "is_available") {
          data.append(key, value ? 1 : 0);
        } else {
          data.append(key, value);
        }
      }
    });

    // Append new images
    newImages.forEach(file => data.append("images[]", file));

    // Append removed images
    removeImages.forEach(id => data.append("remove_images[]", id));

    try {
      setLoading(true);
      await api.put(`/lands/admin/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Land updated successfully");
      navigate("/admin/lands");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Land</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-3 border rounded"
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 border rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 border rounded"
        />

        <input
          name="size"
          value={form.size}
          onChange={handleChange}
          placeholder="Size"
          className="w-full p-3 border rounded"
        />

        <input
          name="price_per_unit"
          value={form.price_per_unit}
          onChange={handleChange}
          placeholder="Price per unit"
          className="w-full p-3 border rounded"
        />

        <input
          name="total_units"
          value={form.total_units}
          onChange={handleChange}
          placeholder="Total units"
          className="w-full p-3 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
          />
          <span>Available</span>
        </label>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {existingImages.map(img => (
              <div key={img.id} className="relative">
                <img
                  src={img.image_url}
                  alt=""
                  className="rounded h-32 w-full object-cover"
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
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded w-full disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}

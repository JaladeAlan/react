import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";
import PolygonMapEditor from "./PolygonMapEditor";

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
    coordinates: null,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soldUnits, setSoldUnits] = useState(0);
  const [usePolygon, setUsePolygon] = useState(false);
  const [initialHasPolygon, setInitialHasPolygon] = useState(false);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await api.get(`/lands/${id}`);
        const land = res.data;

        // Parse coordinates if it's a JSON string
        let parsedCoordinates = null;
        if (land.coordinates) {
          try {
            parsedCoordinates = typeof land.coordinates === 'string' 
              ? JSON.parse(land.coordinates) 
              : land.coordinates;
          } catch (e) {
            console.error("Failed to parse coordinates:", e);
          }
        }

        const hasPolygon = !!parsedCoordinates;
        setInitialHasPolygon(hasPolygon);
        setUsePolygon(hasPolygon);

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
          coordinates: parsedCoordinates,
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

  const handlePolygonChange = (polygon) => {
    setForm({ ...form, coordinates: polygon });
  };

  const toggleCoordinateMode = () => {
    if (!usePolygon && form.coordinates) {
      // Switching to lat/lng - clear polygon
      if (!confirm("This will clear the drawn polygon. Continue?")) return;
      setForm({ ...form, coordinates: null });
    }
    if (usePolygon && (form.lat || form.lng)) {
      // Switching to polygon - clear lat/lng
      if (!confirm("This will clear lat/lng coordinates. Continue?")) return;
      setForm({ ...form, lat: "", lng: "" });
    }
    setUsePolygon(!usePolygon);
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

    // Validate coordinates
    if (usePolygon && !form.coordinates) {
      return toast.error("Please draw a polygon on the map");
    }

    if (!usePolygon && (!form.lat || !form.lng)) {
      return toast.error("Please provide latitude and longitude");
    }

    const data = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (key === "coordinates") {
        // Send polygon as JSON string if present and in polygon mode
        if (value && usePolygon) {
          data.append("coordinates", JSON.stringify(value));
        }
        // If switching from polygon to point, the null will be handled automatically
      } else if (value !== "") {
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

        {/* Coordinate Mode Toggle */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">
              Coordinate Type 
              {initialHasPolygon && <span className="ml-2 text-xs text-gray-500">(initially: polygon)</span>}
            </label>
            <button
              type="button"
              onClick={toggleCoordinateMode}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Switch to {usePolygon ? "Point" : "Polygon"}
            </button>
          </div>

          {!usePolygon ? (
            // Point coordinates (lat/lng)
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="e.g. 6.5244"
                  className="w-full p-3 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="e.g. 3.3792"
                  className="w-full p-3 border rounded"
                />
              </div>
            </div>
          ) : (
            // Polygon drawing
            <div>
              <label className="block text-sm font-medium mb-2">
                Draw Polygon on Map
              </label>
              <PolygonMapEditor
                polygon={form.coordinates}
                onChange={handlePolygonChange}
              />
              {form.coordinates && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Polygon drawn ({form.coordinates.coordinates[0].length - 1} points)
                </p>
              )}
            </div>
          )}
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
          <div>
            <label className="block mb-2 font-medium">Existing Images</label>
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
          className="bg-green-600 text-white px-6 py-3 rounded w-full disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}
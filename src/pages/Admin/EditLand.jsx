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
        const land = res.data.data;

        let parsedCoordinates = null;

        if (land.coordinates) {
          try {
            parsedCoordinates =
              typeof land.coordinates === "string"
                ? JSON.parse(land.coordinates)
                : land.coordinates;
          } catch (e) {
            parsedCoordinates = null;
          }
        }

        const hasPolygon = land.has_polygon || !!parsedCoordinates;

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

        setSoldUnits(
          land.units_sold ||
            land.total_units - land.available_units
        );

        setExistingImages(land.images || []);
      } catch (err) {
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

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePolygonChange = (polygon) => {
    // Ensure proper GeoJSON structure
    let validPolygon = polygon;
    
    // If polygon doesn't have the right structure, fix it
    if (polygon && !polygon.type) {
      validPolygon = {
        type: "Polygon",
        coordinates: polygon.coordinates || polygon
      };
    }
    

    setForm({ ...form, coordinates: validPolygon });
  };

  const toggleCoordinateMode = () => {
    if (!usePolygon) {
      // switching TO polygon
      if (form.lat || form.lng) {
        if (!window.confirm("Switching to polygon will clear latitude and longitude. Continue?")) return;
      }
      setForm({
        ...form,
        lat: "",
        lng: "",
        coordinates: null, 
      });
    } else {
      // switching TO point
      if (form.coordinates) {
        if (!window.confirm("Switching to point will clear polygon. Continue?")) return;
      }
      setForm({
        ...form,
        lat: "",
        lng: "",
        coordinates: null,
      });
    }

    setUsePolygon(!usePolygon);
  };


  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const removeExistingImage = (imgId) => {
    setRemoveImages((prev) => [...prev, imgId]);
    setExistingImages((prev) =>
      prev.filter((img) => img.id !== imgId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usePolygon && !form.coordinates) {
      return toast.error("Please draw a polygon on the map");
    }

    if (!usePolygon && (!form.lat || !form.lng)) {
      return toast.error("Please provide latitude and longitude");
    }

    const payload = {
      title: form.title,
      location: form.location,
      size: parseFloat(form.size) || 0,
      total_units: parseInt(form.total_units) || 0,
      description: form.description,
      is_available: form.is_available ? 1 : 0,
    };

    try {
      setLoading(true);

      const hasImageChanges = newImages.length > 0 || removeImages.length > 0;

      if (hasImageChanges) {
        const formData = new FormData();
        formData.append("_method", "POST");

        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, value ?? "");
        });

        // FIXED: Send coordinates as stringified GeoJSON object
        if (usePolygon && form.coordinates) {
          // Ensure it's a proper GeoJSON object before stringifying
          const geoJson = typeof form.coordinates === 'string' 
            ? JSON.parse(form.coordinates) 
            : form.coordinates;
          
          formData.append("coordinates", JSON.stringify(geoJson));
          // Don't send lat/lng at all when using polygon - they will interfere
        } else if (!usePolygon && form.lat && form.lng) {
          formData.append("lat", parseFloat(form.lat));
          formData.append("lng", parseFloat(form.lng));
          // Don't send coordinates at all when using point
        }

        // images
        newImages.forEach((img) => formData.append("images[]", img));
        removeImages.forEach((imgId) => formData.append("remove_images[]", imgId));

        await api.post(`/lands/admin/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // FIXED: Proper JSON payload structure
        const jsonPayload = { ...payload };

        if (usePolygon && form.coordinates) {
          // Ensure it's a proper object, not a string
          const coords = typeof form.coordinates === 'string'
            ? JSON.parse(form.coordinates)
            : form.coordinates;
          
          // CRITICAL: Only send coordinates, explicitly exclude lat/lng
          jsonPayload.coordinates = coords;
          // Don't send lat/lng at all when using polygon
          delete jsonPayload.lat;
          delete jsonPayload.lng;
        } else if (!usePolygon && form.lat && form.lng) {
          jsonPayload.lat = parseFloat(form.lat);
          jsonPayload.lng = parseFloat(form.lng);
          // Don't send coordinates at all when using point
          delete jsonPayload.coordinates;
        }
        await api.post(`/lands/admin/${id}`, jsonPayload);
      }

      toast.success("Land updated successfully");
      navigate("/admin/lands");
    } catch (err) {
      // Show validation errors if available
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).flat().forEach(error => toast.error(error));
      } else {
        toast.error(err.response?.data?.message || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
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
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        {/* Coordinate Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">
              Coordinate Type
              {initialHasPolygon && (
                <span className="ml-2 text-xs text-gray-500">
                  (initially: polygon)
                </span>
              )}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Latitude</label>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                  required={!usePolygon}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Longitude</label>
                <input
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  className="w-full p-3 border rounded"
                  required={!usePolygon}
                />
              </div>
            </div>
          ) : (
            <div>
              <PolygonMapEditor
                polygon={form.coordinates}
                onChange={handlePolygonChange}
              />
              {form.coordinates && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Polygon drawn ({
                    Array.isArray(form.coordinates?.coordinates?.[0]) 
                      ? form.coordinates.coordinates[0].length - 1 
                      : 0
                  } points)
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
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            rows="4"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block mb-1 font-medium">Land Size (sqm)</label>
          <input
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        {/* Units */}
        <div>
          <label className="block mb-1 font-medium">Total Units</label>
          <input
            name="total_units"
            value={form.total_units}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
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
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">
            Available for Sale
          </span>
        </label>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">
              Existing Images
            </label>
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
                    className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
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
          <label className="block mb-1 font-medium">
            Add New Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {newImages.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {newImages.length} new file(s) selected
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded w-full disabled:opacity-50 hover:bg-green-700"
        >
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}
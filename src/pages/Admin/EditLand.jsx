import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function EditLand() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/lands/${id}`).then(res => {
      setForm(res.data);
      setExistingImages(res.data.images || []);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach(k => data.append(k, form[k]));
    images.forEach(img => data.append("images[]", img));
    removeImages.forEach(id => data.append("remove_images[]", id));

    try {
      setLoading(true);
      await api.post(`/admin/lands/${id}?_method=PUT`, data);
      toast.success("Land updated");
      navigate("/admin/lands");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Land</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={form.title || ""}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full p-3 border rounded"
        />

        <input
          value={form.location || ""}
          onChange={e => setForm({ ...form, location: e.target.value })}
          className="w-full p-3 border rounded"
        />

        <textarea
          value={form.description || ""}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full p-3 border rounded"
        />

        {/* Existing images */}
        <div className="grid grid-cols-3 gap-3">
          {existingImages.map(img => (
            <div key={img.id} className="relative">
              <img src={img.image_path} className="rounded" />
              <button
                type="button"
                onClick={() => setRemoveImages([...removeImages, img.id])}
                className="absolute top-1 right-1 bg-red-600 text-white px-2 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <input type="file" multiple onChange={e => setImages([...e.target.files])} />

        <button className="bg-green-600 text-white px-6 py-3 rounded w-full">
          {loading ? "Saving..." : "Update Land"}
        </button>
      </form>
    </div>
  );
}

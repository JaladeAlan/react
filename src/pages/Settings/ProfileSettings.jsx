import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import handleApiError from "../../utils/handleApiError";

export default function ProfileSettings() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear inline error when user starts typing again
  };

  // Handle password change form submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging confirmation

    // ✅ Basic validation
    if (formData.newPassword !== formData.confirmPassword) {
      const msg = "New passwords do not match";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (formData.newPassword.length < 8) {
      const msg = "New password must be at least 8 characters long";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Payload matches backend expectations
      await api.post("/user/change-password", {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password change error:", err);
      handleApiError(err, setError);
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
      {/* Mount toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Profile Info */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Profile Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={user?.name || ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-300"></div>

      {/* Change Password Section */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Change Password
      </h2>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Inline error message */}
        {error && (
          <p className="text-red-600 text-sm text-center font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-medium transition ${
            loading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

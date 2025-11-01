import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import handleApiError from "../../utils/handleApiError";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/register", form);

      toast.success("Account created successfully! Please verify your email.");

      // Store pending email for verification
      localStorage.setItem("pending_email", form.email);

      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      // Handle backend validation errors gracefully
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        // Fallback for other errors (network, 500, etc.)
        toast.error("Registration failed. Please try again.");
      }

      handleApiError(err, "Registration failed. Please try again.", () => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create Account
        </h2>

        <input
          name="name"
          onChange={handleChange}
          value={form.name}
          placeholder="Fullname"
          className="border w-full mb-3 px-3 py-2 rounded"
          required
        />
        <input
          name="email"
          onChange={handleChange}
          value={form.email}
          placeholder="Email"
          type="email"
          className="border w-full mb-3 px-3 py-2 rounded"
          required
        />
        <input
          name="password"
          onChange={handleChange}
          value={form.password}
          placeholder="Password"
          type="password"
          className="border w-full mb-3 px-3 py-2 rounded"
          required
        />
        <input
          name="password_confirmation"
          onChange={handleChange}
          value={form.password_confirmation}
          placeholder="Confirm Password"
          type="password"
          className="border w-full mb-4 px-3 py-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

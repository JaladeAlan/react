// src/pages/Auth/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <input name="name" onChange={handleChange} value={form.name} placeholder="Name" className="border w-full mb-3 px-3 py-2 rounded" />
        <input name="email" onChange={handleChange} value={form.email} placeholder="Email" type="email" className="border w-full mb-3 px-3 py-2 rounded" />
        <input name="password" onChange={handleChange} value={form.password} placeholder="Password" type="password" className="border w-full mb-3 px-3 py-2 rounded" />
        <input name="password_confirmation" onChange={handleChange} value={form.password_confirmation} placeholder="Confirm Password" type="password" className="border w-full mb-4 px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
        <p className="text-center text-sm mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}

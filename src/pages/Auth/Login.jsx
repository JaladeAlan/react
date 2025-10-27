import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import handleApiError from "../../utils/handleApiError";
import FormError from "../../components/FormError"; 

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false); // <-- added loading state
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true); // <-- start loading

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      handleApiError(err, setError, setFieldErrors);
    } finally {
      setLoading(false); // <-- stop loading
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <div className="mb-3">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className={`border w-full px-3 py-2 rounded ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
          />
          <FormError error={fieldErrors.email} /> 
        </div>

        <div className="mb-3">
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className={`border w-full px-3 py-2 rounded ${
              fieldErrors.password ? "border-red-500" : ""
            }`}
          />
          <FormError error={fieldErrors.password} /> 
        </div>

        <p className="text-right text-sm mb-4">
          <Link
            to="/forgot-password"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent hover:from-indigo-600 hover:to-blue-500 transition-all"
          >
            Forgot Password?
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white flex items-center justify-center ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

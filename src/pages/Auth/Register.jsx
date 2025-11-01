import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import handleApiError from "../../utils/handleApiError";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Password validation rules
  const passwordChecks = [
    { test: /.{8,}/, label: "At least 8 characters" },
    { test: /[A-Z]/, label: "One uppercase letter" },
    { test: /[a-z]/, label: "One lowercase letter" },
    { test: /\d/, label: "One number" },
    { test: /[!@#$%^&*]/, label: "One special character (!@#$%^&*)" },
  ];

  const passedChecks = passwordChecks.filter((c) =>
    c.test.test(form.password)
  ).length;

  const strengthColors = [
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-green-600",
  ];
  const strengthText = [
    "Too weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/register", form);
      toast.success("Registration successful! Please verify your email.");

      localStorage.setItem("pending_email", form.email);
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      console.error("Full error:", err.response);
      if (err.response?.status === 422) {
        const { errors } = err.response.data;
        if (errors) {
          Object.values(errors).forEach((msgs) =>
            msgs.forEach((msg) => toast.error(msg))
          );
        } else {
          toast.error("Validation failed. Please check your input.");
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Create Account
        </h2>

        {/* Full name */}
        <input
          name="name"
          onChange={handleChange}
          value={form.name}
          placeholder="Full Name"
          className="border w-full mb-3 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />

        {/* Email */}
        <input
          name="email"
          onChange={handleChange}
          value={form.email}
          placeholder="Email"
          type="email"
          className="border w-full mb-3 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />

        {/* Password Field */}
        <div className="relative mb-4">
          <input
            name="password"
            onChange={handleChange}
            value={form.password}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="border w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />

          {/* Show/hide password toggle */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>

          {/* Strength Meter */}
          {form.password && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <motion.div
                  className={`h-2 rounded-full ${
                    strengthColors[passedChecks - 1] || "bg-gray-200"
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(passedChecks / passwordChecks.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p
                className={`text-xs ${
                  passedChecks <= 2
                    ? "text-red-500"
                    : passedChecks === 3
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}
              >
                {strengthText[passedChecks - 1] || "Enter password"}
              </p>
            </div>
          )}

          {/* Animated Password Rules */}
          <AnimatePresence>
            {form.password && focused && (
              <motion.ul
                className="text-xs mt-3 space-y-1 bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
              >
                {passwordChecks.map((check, i) => {
                  const passed = check.test.test(form.password);
                  return (
                    <motion.li
                      key={i}
                      className={`flex items-center gap-2 ${
                        passed ? "text-green-600" : "text-gray-500"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="text-lg">{passed ? "✅" : "❌"}</span>
                      {check.label}
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <input
          name="password_confirmation"
          onChange={handleChange}
          value={form.password_confirmation}
          placeholder="Confirm Password"
          type={showPassword ? "text" : "password"}
          className="border w-full mb-5 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || passedChecks < passwordChecks.length}
          className={`w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition ${
            loading || passedChecks < passwordChecks.length
              ? "opacity-70 cursor-not-allowed"
              : ""
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

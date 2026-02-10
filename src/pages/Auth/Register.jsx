import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react";
import api from "../../utils/api";

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

  const passwordsMatch = form.password && form.password_confirmation && 
    form.password === form.password_confirmation;
  
  const passwordsDontMatch = form.password_confirmation && !passwordsMatch;

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            GrowthApp
          </h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 shadow-xl rounded-2xl border border-gray-100"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="name"
                name="name"
                onChange={handleChange}
                value={form.name}
                placeholder="John Doe"
                autoComplete="name"
                className="border border-gray-300 w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="email"
                name="email"
                onChange={handleChange}
                value={form.email}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                className="border border-gray-300 w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="password"
                name="password"
                onChange={handleChange}
                value={form.password}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="border border-gray-300 w-full pl-10 pr-12 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Meter */}
            {form.password && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full transition-colors ${
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
                  className={`text-xs font-medium ${
                    passedChecks <= 2
                      ? "text-red-500"
                      : passedChecks === 3
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  Password strength: {strengthText[passedChecks - 1] || "Enter password"}
                </p>
              </div>
            )}

            {/* Animated Password Rules */}
            <AnimatePresence>
              {form.password && focused && (
                <motion.ul
                  className="text-xs mt-3 space-y-1.5 bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {passwordChecks.map((check, i) => {
                    const passed = check.test.test(form.password);
                    return (
                      <motion.li
                        key={i}
                        className={`flex items-center gap-2 ${
                          passed ? "text-green-600" : "text-gray-500"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <span className="text-base">{passed ? "✓" : "○"}</span>
                        <span>{check.label}</span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="password_confirmation"
                name="password_confirmation"
                onChange={handleChange}
                value={form.password_confirmation}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`border w-full pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${
                  passwordsDontMatch ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                required
              />
              {passwordsMatch && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                  ✓
                </span>
              )}
            </div>
            {passwordsDontMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passedChecks < passwordChecks.length || passwordsDontMatch}
            className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${
              loading || passedChecks < passwordChecks.length || passwordsDontMatch
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
} 
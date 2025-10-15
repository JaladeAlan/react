import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found in localStorage");

        // ✅ Explicitly verify token is being attached
        console.log("Token in ProtectedRoute:", token);

        // This uses your Axios instance, which should attach the Bearer header automatically.
        const res = await api.get("/me");
        console.log("Auth check success:", res.data);

        setAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err.response?.data || err.message);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );

  return authenticated ? children : <Navigate to="/login" replace />;
}

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
        if (!token) throw new Error("No token found");

        // ✅ Log only in dev mode
        if (import.meta.env.MODE === "development") {
          console.log("ProtectedRoute: token found");
        }

        const res = await api.get("/me"); // assumes backend checks token
        if (res.data?.success) {
          setAuthenticated(true);
        } else {
          throw new Error("Auth check failed");
        }
      } catch (err) {
        if (import.meta.env.MODE === "development") {
          console.error("Auth check failed:", err.response?.data || err.message);
        }

        // Optional: clear bad token if it's expired or invalid
        localStorage.removeItem("token");
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

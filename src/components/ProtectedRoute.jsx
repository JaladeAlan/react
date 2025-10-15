// src/components/ProtectedRoute.jsx
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
        if (!token) throw new Error("No token");
        await api.get("/me");
        setAuthenticated(true);
      } catch {
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

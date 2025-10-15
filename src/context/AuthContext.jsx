import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth check failed:", err.response?.data || err.message);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });

      console.log("Full login response:", res);

      // ✅ Handle all possible shapes
      let token =
        res?.data?.data?.token || // expected shape
        res?.data?.token || // fallback
        (typeof res?.data?.data === "string"
          ? JSON.parse(res.data.data)?.token
          : null);

      console.log("Extracted token:", token);

      if (!token) {
        throw new Error("No token returned from backend");
      }

      localStorage.setItem("token", token);
      console.log("Token saved to localStorage ✅");

      await checkAuth();
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw err;
    }
  };


  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("Logout error:", err);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

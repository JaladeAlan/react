import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const res = await api.get("/me");
      setUser(res.data.user || res.data);
    } catch (err) {
      console.error("Auth check failed:", err.response?.data || err.message);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      toast.error("Session expired. Please log in again.");

      // Save current page before redirect
      localStorage.setItem("redirectAfterLogin", location.pathname);
      navigate("/login", { replace: true });
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

      const token =
        res?.data?.token ||
        res?.data?.data?.token ||
        res?.data?.access_token ||
        (typeof res?.data?.data === "string"
          ? JSON.parse(res.data.data)?.token
          : null);

      if (!token) throw new Error("No token returned from backend");

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await checkAuth();

      toast.success("Login successful!");

      // Go to saved page or dashboard
      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/dashboard";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error("Login failed. Please check your credentials.");
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
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    toast.info("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

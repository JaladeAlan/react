import {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import { resetNotificationCache } from "../services/notificationService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Prevent double execution (React 18 StrictMode)
  const hasCheckedAuth = useRef(false);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const res = await api.get("/me");
      setUser(res.data.user ?? res.data);
    } catch (err) {
      console.error("Auth check failed:", err);

      // reset notifications on auth failure
      resetNotificationCache();

      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
      setUser(null);

      localStorage.setItem("redirectAfterLogin", location.pathname);
      toast.error("Session expired. Please log in again.");
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });

      const token =
        res.data?.token ||
        res.data?.access_token ||
        res.data?.data?.token;

      if (!token) throw new Error("Token not returned");

      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Prefer backend user
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        await checkAuth();
      }

      toast.success("Login successful!");

      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/dashboard";
      localStorage.removeItem("redirectAfterLogin");

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
      throw err;
    }
  };

  const logout = () => {
    api.post("/logout").catch(() => {});

    // reset notifications on logout
    resetNotificationCache();

    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;

    setUser(null);
    toast.info("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
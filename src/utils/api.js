import axios from "axios";
import toast from "react-hot-toast";

// Create the axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
  headers: {
    Accept: "application/json",
  },
});

// Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupApiInterceptors = (navigate) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");

        // Use React Router navigation
        navigate("/login", { replace: true });
      }
      return Promise.reject(error);
    }
  );
};

export default api;
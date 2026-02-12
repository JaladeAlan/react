import axios from "axios";

export async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const response = await axios.get(`${baseURL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error("Token check failed:", error);
    localStorage.removeItem("token");
    return false;
  }
}

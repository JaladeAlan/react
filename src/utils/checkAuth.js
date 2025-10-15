import axios from "axios";

export async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await axios.get("http://127.0.0.1:8000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.status === 200;
  } catch (error) {
    console.error("Token check failed:", error);
    localStorage.removeItem("token");
    return false;
  }
}

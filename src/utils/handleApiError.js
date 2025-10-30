import { toast } from "react-toastify";

export default function handleApiError(err, fallbackMessage, setError) {
  console.log("🔥 Full error object:", err);

  // Handle no response (network/CORS errors)
  if (!err.response) {
    console.error("Network or CORS error:", err);
    const message = "Network error — please check your connection.";
    if (typeof setError === "function") setError(message);
    else toast.error(message);
    return;
  }

  const data = err.response.data;
  console.log("📦 Response data:", data);

  let message =
    data?.message ||
    data?.error ||
    (data?.errors
      ? Object.values(data.errors).flat().join("\n")
      : fallbackMessage || "Something went wrong.");

  // If setError is provided (like from useState)
  if (typeof setError === "function") {
    setError(message);
  } else {
    // Otherwise use toast for global feedback
    toast.error(message);
  }
}

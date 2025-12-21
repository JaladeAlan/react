const API_URL = import.meta.env.VITE_API_BASE_URL || "https://growth-estate.onrender.com";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Get all notifications
export async function fetchNotifications() {
  const res = await fetch(`${API_URL}/api/notifications`, { headers: getAuthHeaders() });
  return res.json();
}

// Get only unread notifications
export async function fetchUnreadNotifications() {
  const res = await fetch(`${API_URL}/api/notifications/unread`, { headers: getAuthHeaders() });
  return res.json();
}

// Mark all as read
export async function markAllNotificationsRead() {
  const res = await fetch(`${API_URL}/api/notifications/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

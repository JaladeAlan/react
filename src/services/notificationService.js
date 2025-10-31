const API_URL = "https://growth-estate.onrender.com/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Get all notifications
export async function fetchNotifications() {
  const res = await fetch(`${API_URL}/notifications`, { headers: getAuthHeaders() });
  return res.json();
}

// Get only unread notifications
export async function fetchUnreadNotifications() {
  const res = await fetch(`${API_URL}/notifications/unread`, { headers: getAuthHeaders() });
  return res.json();
}

// Mark all as read
export async function markAllNotificationsRead() {
  const res = await fetch(`${API_URL}/notifications/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

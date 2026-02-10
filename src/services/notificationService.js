import api from "../utils/api";

let unreadCache = null;
let allCache = null;
let unreadPromise = null;
let allPromise = null;

// Fetch all notifications
export function fetchNotifications(force = false) {
  if (allCache && !force) return Promise.resolve(allCache);
  if (allPromise && !force) return allPromise;

  allPromise = api.get("/notifications").then((res) => {
    allCache = res.data;
    allPromise = null;
    return allCache;
  });

  return allPromise;
}

// Fetch unread notifications
export function fetchUnreadNotifications(force = false) {
  if (unreadCache && !force) return Promise.resolve(unreadCache);
  if (unreadPromise && !force) return unreadPromise;

  unreadPromise = api.get("/notifications/unread").then((res) => {
    unreadCache = res.data;
    unreadPromise = null;
    return unreadCache;
  });

  return unreadPromise;
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  await api.post("/notifications/read");
  resetNotificationCache();
  return true;
}

// Mark single notification as read
export async function markNotificationRead(notificationId) {
  await api.post(`/notifications/${notificationId}/read`);
  resetNotificationCache();
  return true;
}

// Reset cache
export function resetNotificationCache() {
  unreadCache = null;
  allCache = null;
  unreadPromise = null;
  allPromise = null;
}
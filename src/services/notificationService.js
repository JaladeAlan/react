import api from "../utils/api";

let unreadCache = null;
let allCache = null;
let unreadFetched = false;
let allFetched = false;

// All notifications
export async function fetchNotifications(force = false) {
  if (allFetched && allCache && !force) return allCache;

  const res = await api.get("/notifications");
  allCache = res.data;
  allFetched = true;

  return allCache;
}

// Unread notifications
export async function fetchUnreadNotifications(force = false) {
  if (unreadFetched && unreadCache && !force) return unreadCache;

  const res = await api.get("/notifications/unread");
  unreadCache = res.data;
  unreadFetched = true;

  return unreadCache;
}

// Mark read
export async function markAllNotificationsRead() {
  await api.post("/notifications/read");

  // invalidate cache
  resetNotificationCache();
  return true;
}

// Reset (used on logout / auth failure)
export function resetNotificationCache() {
  unreadCache = null;
  allCache = null;
  unreadFetched = false;
  allFetched = false;
}

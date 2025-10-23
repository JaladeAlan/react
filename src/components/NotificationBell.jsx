import { useEffect, useState } from "react";
import { Bell } from "lucide-react"; // icon
import {
  fetchNotifications,
  fetchUnreadNotifications,
  markAllNotificationsRead,
} from "../services/notificationService";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const unreadRes = await fetchUnreadNotifications();
      const allRes = await fetchNotifications();
      setUnreadCount(unreadRes.unread_notifications?.length || 0);
      setNotifications(allRes.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    loadNotifications();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold">Notifications</span>
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-gray-500 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={i}
                  className={`p-3 border-b hover:bg-gray-50 ${
                    n.read_at ? "text-gray-500" : "text-gray-800 font-medium"
                  }`}
                >
                  <p>{n.data?.message || "New activity"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

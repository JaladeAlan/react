import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

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

  // Handle click - dropdown on desktop, navigate on mobile
  const handleBellClick = () => {
    if (window.innerWidth < 768) {
      navigate("/notifications");
    } else {
      setOpen(!open);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown (Desktop only) */}
      {open && (
        <div
          ref={dropdownRef}
          className="hidden md:block absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border z-50"
        >
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-gray-500 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm text-center">
                No notifications yet
              </p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${
                    !n.read_at ? "bg-blue-50" : ""
                  }`}
                >
                  <p className={`text-sm ${!n.read_at ? "font-semibold" : ""}`}>
                    {n.data?.message || "New activity"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t text-center">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
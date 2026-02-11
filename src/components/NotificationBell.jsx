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

  const handleBellClick = () => {
    if (window.innerWidth < 768) {
      navigate("/notifications");
    } else {
      setOpen(!open);
    }
  };

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
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="hidden md:block fixed inset-0 z-[9100]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className="hidden md:block absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 z-[9300]"
          >
            <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
              <span className="font-semibold text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${
                      !n.read_at ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <p className={`text-sm ${!n.read_at ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {n.data?.message || "New activity"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-3 border-t text-center bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => {
                    navigate("/notifications");
                    setOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications || []);
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
    loadNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    loadNotifications();
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-4 border-b">
          <button
            onClick={() => setFilter("all")}
            className={`pb-2 px-1 ${
              filter === "all"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`pb-2 px-1 ${
              filter === "unread"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : "text-gray-600"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read_at && handleMarkAsRead(n.id)}
                className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition hover:shadow ${
                  !n.read_at ? "border-l-4 border-l-blue-600 bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p
                      className={`${
                        !n.read_at ? "font-semibold text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {n.data?.message || "New activity"}
                    </p>
                    {n.data?.units && (
                      <p className="text-sm text-gray-600 mt-1">
                        {n.data.units} units • ₦
                        {(n.data.amount_kobo / 100).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
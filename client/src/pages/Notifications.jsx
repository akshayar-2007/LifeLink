import { useState, useEffect } from "react";
import API from "../utils/api";

// Icon and color for each notification type
const notificationConfig = {
  new_request: {
    icon: "🩸",
    bg: "bg-red-50",
    border: "border-red-100",
    iconBg: "bg-red-100"
  },
  donor_responded: {
    icon: "🎉",
    bg: "bg-green-50",
    border: "border-green-100",
    iconBg: "bg-green-100"
  },
  request_fulfilled: {
    icon: "✅",
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100"
  },
  system: {
    icon: "📢",
    bg: "bg-gray-50",
    border: "border-gray-100",
    iconBg: "bg-gray-100"
  }
};

// Time ago helper
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch on page load
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ── FETCH ALL NOTIFICATIONS ────────────
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);

      // Count unread
      const unread = res.data.notifications?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unread);

    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── MARK SINGLE AS READ ────────────────
  const handleMarkRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);

      // Update local state — no need to refetch
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // ── MARK ALL AS READ ───────────────────
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await API.put("/notifications/read-all");

      // Update all local notifications to read
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);

    } catch (err) {
      console.error("Mark all read error:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // ── DELETE SINGLE ──────────────────────
  const handleDelete = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);

      // Check if it was unread before removing
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Remove from local state
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ── CLEAR ALL ─────────────────────────
  const handleClearAll = async () => {
    // Confirm before deleting all
    if (!window.confirm("Delete all notifications? This cannot be undone.")) {
      return;
    }

    setClearingAll(true);
    try {
      await API.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Clear all error:", err);
    } finally {
      setClearingAll(false);
    }
  };

  // Click on notification → mark as read
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── HEADER ────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Notifications 🔔
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"
              }
            </p>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium px-3 py-2 rounded-lg disabled:opacity-50"
                >
                  {markingAll ? "Marking..." : "✓ Mark All Read"}
                </button>
              )}
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-2 rounded-lg disabled:opacity-50"
              >
                {clearingAll ? "Clearing..." : "🗑️ Clear All"}
              </button>
            </div>
          )}
        </div>

        {/* ── LOADING ───────────────────────── */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">🔔</div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        )}

        {/* ── NOTIFICATIONS LIST ────────────── */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map(notification => {
              const config = notificationConfig[notification.type]
                || notificationConfig.system;

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative flex items-start gap-4 p-4 rounded-2xl border
                    transition-all cursor-pointer
                    ${notification.isRead
                      ? "bg-white border-gray-100 opacity-75"
                      : `${config.bg} ${config.border} shadow-sm`
                    }
                    hover:shadow-md hover:opacity-100
                  `}
                >
                  {/* Unread Blue Dot */}
                  {!notification.isRead && (
                    <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-xl flex items-center
                    justify-center text-lg ml-3
                    ${notification.isRead ? "bg-gray-100" : config.iconBg}
                  `}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${
                      notification.isRead ? "text-gray-600" : "text-gray-800"
                    }`}>
                      {notification.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      notification.isRead ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering mark read
                      handleDelete(notification._id);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── EMPTY STATE ───────────────────── */}
        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-14 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="font-semibold text-gray-700 text-xl mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              When someone needs blood in your area
              <br />or a donor responds to your request,
              <br />you'll see it here.
            </p>
          </div>
        )}

        {/* ── NOTIFICATION LEGEND ───────────── */}
        {!loading && notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              NOTIFICATION TYPES
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(notificationConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${config.iconBg}`}>
                    {config.icon}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {type.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API_CONFIG from "../config/api";

function getAuthToken() {
  return (
    localStorage.getItem("hexagon_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

export function useNotificationsSocket() {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    // Get base URL from API config
    const baseUrl = API_CONFIG.getCurrentBackendUrl();
    const socketUrl = baseUrl || "http://localhost:5003";

    // Connect to notifications namespace
    const socket = io(`${socketUrl}/notifications`, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Notifications] Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[Notifications] Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[Notifications] Connection error:", error);
      setIsConnected(false);
    });

    // Receive initial notifications list
    socket.on("notifications", (data) => {
      setNotifications(Array.isArray(data) ? data : []);
    });

    // Receive new notification
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle notification read confirmation
    socket.on("notificationRead", (data) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === data.notificationId ? { ...n, isRead: true } : n
        )
      );
    });

    socket.on("error", (error) => {
      console.error("[Notifications] Socket error:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const markAsRead = (notificationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("markRead", { notificationId });
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    }
  };

  return {
    notifications,
    isConnected,
    markAsRead,
  };
}


import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return; // якщо userId немає, нічого не робимо
    const token = localStorage.getItem("token");

    // 1. REST-запит на існуючі сповіщення
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/notifications/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    // 2. Підключення до STOMP
    const socket = new SockJS("http://localhost:8080/ws/notifications");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
        const data = JSON.parse(message.body);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    };

    stompClient.activate();

    return () => stompClient.deactivate();
  }, [userId]);

  // 3. Відмітка всіх як прочитаних
  const markAllRead = async () => {
    if (!userId) return; // перевірка на null
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:8080/api/notifications/${userId}/markAllRead`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  return { notifications, unreadCount, markAllRead };
}

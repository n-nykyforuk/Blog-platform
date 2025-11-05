import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const { notifications, unreadCount, markAllRead } = useNotifications(userId);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) markAllRead();
  };

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #ddd",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <h2
        style={{ cursor: "pointer", color: "#333" }}
        onClick={() => navigate("/feed")}
      >
        📸 InstaClone
      </h2>

      <div style={{ display: "flex", gap: "15px", position: "relative" }}>
        <button onClick={() => navigate("/feed")}>🏠 Feed</button>
        <button onClick={() => navigate("/create-post")}>➕ Post</button>
        <button onClick={() => navigate("/search")}>🔍 Search</button>
        <button onClick={() => navigate("/chats")}>💬 Chats</button>
        <button onClick={() => navigate(`/profile/${username}`)}>👤 Profile</button>

        {/* 🔔 Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={toggleDropdown}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-8px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "10px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🧾 Випадаючий список */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: 0,
                width: "250px",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                zIndex: 20,
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {notifications.length === 0 ? (
                <p style={{ padding: "10px", color: "#666", fontSize: "14px" }}>
                  No notifications
                </p>
              ) : (
                notifications.map((n, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #eee",
                      fontSize: "14px",
                      background: n.read ? "#fff" : "#f9f9f9",
                    }}
                  >
                    <strong>{n.fromUser}</strong>{" "}
                    {n.type === "LIKE" && "liked your post"}
                    {n.type === "COMMENT" && "commented on your post"}
                    {n.type === "FOLLOW" && "started following you"}
                    {n.type === "MESSAGE" && "sent you a message"}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={{ color: "red" }}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ListChatPage() {
  const [chats, setChats] = useState([]);
  const [userStories, setUserStories] = useState({});
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("username");
  const navigate = useNavigate();
  const defaultAvatar = "/uploads/default.jpg";

  const viewedStories = JSON.parse(localStorage.getItem("viewedStories") || "[]");

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats/my", {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);

        // після отримання чатів — підтягнути сторіс кожного співрозмовника
        data.forEach((chat) => {
          const otherUser =
            chat.user1Username === currentUser
              ? chat.user2Username
              : chat.user1Username;
          fetchUserStories(otherUser);
        });
      } else {
        console.error("Failed to load chats", res.status);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const fetchUserStories = async (username) => {
    try {
      const res = await fetch(`/api/stories/${username}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const stories = await res.json();
        setUserStories((prev) => ({ ...prev, [username]: stories }));
      }
    } catch (err) {
      console.error("Error fetching stories for", username, err);
    }
  };

  const deleteChat = async (chatId) => {
    if (!window.confirm("Видалити цей чат для обох користувачів?")) return;
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
      } else {
        console.error("Failed to delete chat", res.status);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  // 🔵 аватар з кільцем для сторіс
  const renderAvatar = (username, avatarUrl) => {
    const stories = userStories[username] || [];
    const hasStories = stories.length > 0;
    const isViewed = viewedStories.includes(username);

    return (
      <img
        src={avatarUrl || defaultAvatar}
        alt="avatar"
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          objectFit: "cover",
          border: hasStories
            ? isViewed
              ? "3px solid gray"
              : "3px solid deeppink"
            : "3px solid transparent",
          padding: hasStories ? "2px" : "0",
          cursor: hasStories ? "pointer" : "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasStories) navigate(`/stories/view/${username}`);
        }}
      />
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h2>💬 Мої чати</h2>
        {chats.length === 0 ? (
          <p>Немає активних чатів.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {chats.map((chat) => {
              const otherUser =
                chat.user1Username === currentUser
                  ? chat.user2Username
                  : chat.user1Username;

              const avatar =
                chat.user1Username === currentUser
                  ? chat.user2AvatarUrl || defaultAvatar
                  : chat.user1AvatarUrl || defaultAvatar;

              return (
                <div
                  key={chat.id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    {renderAvatar(otherUser, avatar)}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#007bff",
                      }}
                    >
                      {otherUser}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteChat(chat.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState("");
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("username");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const defaultAvatar = "/uploads/default.jpg";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPartner = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/partner`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const username = await res.text();
        setPartner(username);
      } else {
        console.error("Failed to load partner name", res.status);
      }
    } catch (err) {
      console.error("Error fetching partner name:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${chatId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        console.error("Failed to load messages", res.status);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await fetch(`/api/messages/${chatId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        console.error("Failed to send message", res.status);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    fetchPartner();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        {/* Заголовок чату */}
        <h2 style={{ marginBottom: "10px" }}>
          💬{" "}
          {partner ? (
            <span
              onClick={() => navigate(`/profile/${partner}`)}
              style={{
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {partner}
            </span>
          ) : (
            "Loading..."
          )}
        </h2>

        {/* Контейнер повідомлень */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "10px",
            height: "400px",
            overflowY: "auto",
            marginBottom: "10px",
            background: "#f9f9f9",
          }}
        >
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderUsername === currentUser;
              const readByOther = msg.read && isCurrentUser;
              const avatar = msg.senderAvatarUrl || defaultAvatar;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isCurrentUser
                      ? "flex-end"
                      : "flex-start",
                    alignItems: "flex-end",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  {!isCurrentUser && (
                    <img
                      src={avatar}
                      alt="avatar"
                      onClick={() =>
                        navigate(`/profile/${msg.senderUsername}`)
                      }
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                  )}

                  <div
                    style={{
                      background: isCurrentUser ? "#aee1f9" : "#f1f0f0",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      maxWidth: "70%",
                      position: "relative",
                    }}
                  >
                    <strong>{msg.senderUsername}</strong>
                    <div>{msg.content}</div>
                    {readByOther && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "blue",
                          textAlign: "right",
                          marginTop: "4px",
                        }}
                      >
                        Seen
                      </div>
                    )}
                  </div>

                  {isCurrentUser && (
                    <img
                      src={avatar}
                      alt="avatar"
                      onClick={() =>
                        navigate(`/profile/${msg.senderUsername}`)
                      }
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле введення */}
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

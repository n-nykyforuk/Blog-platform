import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [userStories, setUserStories] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const viewedStories = JSON.parse(localStorage.getItem("viewedStories") || "[]");
  const defaultAvatar = "/uploads/default.jpg";

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`/api/users/search?username=${query}`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setResults(data);

      // Підтягуємо сторіс усіх знайдених користувачів
      data.forEach((user) => fetchUserStories(user.username));
    } catch (err) {
      console.error(err);
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

  // 🔵 Рендер аватарки зі сторіс-підсвіткою
  const renderAvatar = (user) => {
    const stories = userStories[user.username] || [];
    const hasStories = stories.length > 0;
    const isViewed = viewedStories.includes(user.username);

    return (
      <img
        src={user.avatarUrl || defaultAvatar}
        alt="avatar"
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          objectFit: "cover",
          border: hasStories
            ? isViewed
              ? "3px solid gray" // вже переглянуто
              : "3px solid deeppink" // нові сторіс
            : "3px solid transparent",
          padding: hasStories ? "2px" : "0",
          cursor: hasStories ? "pointer" : "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasStories) navigate(`/stories/view/${user.username}`);
        }}
      />
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 10px" }}>
        <h2>🔍 Search Users</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {results.length > 0 ? (
          results.map((user) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #ddd",
                cursor: "pointer",
                gap: "15px",
              }}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              {renderAvatar(user)}
              <span style={{ fontSize: "18px", color: "blue" }}>
                {user.username}
              </span>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </>
  );
}

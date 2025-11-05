  import React, { useEffect, useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";

  export default function ViewStoryPage() {
    const { username } = useParams();
    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("username");

    useEffect(() => {
      fetch(`/api/stories/${username}`, {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((data) => {
          // сортуємо, щоб перше було найстаріше
          const sorted = data.sort((a, b) => a.id - b.id);
          setStories(sorted);

          // позначаємо як переглянутого користувача
          const viewedUsers = JSON.parse(localStorage.getItem("viewedStories") || "[]");
          if (!viewedUsers.includes(username)) {
            viewedUsers.push(username);
            localStorage.setItem("viewedStories", JSON.stringify(viewedUsers));
          }
        })
        .catch((err) => console.error(err));
    }, [username, token]);

    const handleNext = (e) => {
      e.stopPropagation();
      if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = (e) => {
      e.stopPropagation();
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleDelete = async (storyId) => {
      if (!window.confirm("Видалити цю сторіс для всіх?")) return;

      try {
        const res = await fetch(`/api/stories/${storyId}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const updated = stories.filter((s) => s.id !== storyId);
          setStories(updated);
          if (updated.length === 0) navigate(-1);
          else setCurrentIndex((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Помилка видалення сторіс:", err);
      }
    };

    if (stories.length === 0)
      return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          No stories for this user.
        </div>
      );

    const currentStory = stories[currentIndex];

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
        }}
        onClick={() => navigate(-1)}
      >
        {/* поточна сторіс */}
        <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
          {currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl}
              controls
              autoPlay
              style={{ maxHeight: "80vh", borderRadius: "10px" }}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="story"
              style={{ maxHeight: "80vh", borderRadius: "10px" }}
            />
          )}

          {/* Кнопка видалення (тільки якщо своя сторіс) */}
          {username === currentUser && (
            <button
              onClick={() => handleDelete(currentStory.id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255,0,0,0.8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              🗑️ Видалити
            </button>
          )}
        </div>

        {/* Стрілки перемикання */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "30px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.3)",
              border: "none",
              borderRadius: "50%",
              color: "white",
              fontSize: "30px",
              cursor: "pointer",
              width: "50px",
              height: "50px",
            }}
          >
            ←
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "30px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.3)",
              border: "none",
              borderRadius: "50%",
              color: "white",
              fontSize: "30px",
              cursor: "pointer",
              width: "50px",
              height: "50px",
            }}
          >
            →
          </button>
        )}

        <p style={{ color: "white", marginTop: "20px" }}>Tap anywhere to exit</p>
      </div>
    );
  }

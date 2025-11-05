import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("username");

  // Отримати дані профілю
  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${username}/profile`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Отримати сторіс користувача
  const fetchUserStories = async () => {
    try {
      const res = await fetch(`/api/stories/${username}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setUserStories(data);

        // 🧹 очищаємо локальні "viewedStories", якщо сторіс вже видалено
        const viewedUsers = JSON.parse(localStorage.getItem("viewedStories") || "[]");
        const isStillValid = data.length > 0;
        if (!isStillValid && viewedUsers.includes(username)) {
          const updated = viewedUsers.filter((u) => u !== username);
          localStorage.setItem("viewedStories", JSON.stringify(updated));
        }
      } else if (res.status === 404) {
        setUserStories([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🕒 автоматичне оновлення сторіс щохвилини
  useEffect(() => {
    fetchProfile();
    fetchUserStories();

    const interval = setInterval(fetchUserStories, 60000); // 1 хвилина
    return () => clearInterval(interval);
  }, [username]);

  const toggleFollow = async () => {
    if (!profile || currentUser === profile.username) return;

    const url = profile.following
      ? `/api/users/${username}/unfollow`
      : `/api/users/${username}/follow`;
    const method = profile.following ? "DELETE" : "POST";

    try {
      await fetch(url, { method, headers: { Authorization: "Bearer " + token } });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async () => {
    try {
      const res = await fetch(`/api/chats/start/${username}`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const chat = await res.json();
        navigate(`/chat/${chat.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (postId) => {
    if (!commentText[postId]) return;
    try {
      await fetch(`/api/posts/post/${postId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText[postId] }),
      });
      setCommentText({ ...commentText, [postId]: "" });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/posts/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Зміна аватарки
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/users/${username}/avatar`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      if (res.ok) {
        fetchProfile();
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
  };

  // Клік по аватарці → якщо є активні сторіс — перейти до сторіс
  const handleAvatarClick = () => {
    if (userStories.length > 0) {
      navigate(`/stories/view/${username}`);
    } else {
      navigate(`/profile/${username}`);
    }
  };

  if (!profile) return <div>Loading...</div>;

  const isOwnProfile = currentUser === profile.username;
  const isMutualFollow = profile.mutualFollow;
  const avatarSrc =
    profile.avatarUrl && profile.avatarUrl.trim() !== ""
      ? profile.avatarUrl
      : "/uploads/default.jpg";

  // 🟣 Кільце навколо аватарки
  const viewedUsers = JSON.parse(localStorage.getItem("viewedStories") || "[]");
  const hasNewStories = userStories.length > 0 && !viewedUsers.includes(username);

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "800px", margin: "20px auto", padding: "0 10px" }}>
        {/* Профільна секція */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "10px",
          }}
        >
          <div
            style={{
              position: "relative",
              border:
                userStories.length > 0
                  ? hasNewStories
                    ? "3px solid #ff006e" // рожеве — є нові
                    : "3px solid #aaa" // сіре — переглянуто
                  : "3px solid transparent",
              borderRadius: "50%",
              padding: "3px",
              cursor: "pointer",
              transition: "border-color 0.3s ease",
            }}
            onClick={handleAvatarClick}
          >
            <img
              src={avatarSrc}
              alt="avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            {isOwnProfile && (
              <>
                <input
                  type="file"
                  id="avatarUpload"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <label
                  htmlFor="avatarUpload"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    background: "#1976d2",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Edit
                </label>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/stories/create");
                  }}
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </>
            )}
          </div>

          <div>
            <h2>{profile.username}</h2>
            <p>
              Posts: {profile.postsCount} | Followers:{" "}
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => navigate(`/profile/${username}/followers`)}
              >
                {profile.followersCount}
              </span>{" "}
              | Following:{" "}
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => navigate(`/profile/${username}/following`)}
              >
                {profile.followingCount}
              </span>
            </p>

            {!isOwnProfile && (
              <>
                <button onClick={toggleFollow}>
                  {profile.following ? "Following" : "Follow"}
                </button>
                {isMutualFollow && (
                  <button
                    onClick={startChat}
                    style={{
                      marginLeft: "10px",
                      background: "#00bcd4",
                      color: "white",
                    }}
                  >
                    Message
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Пости */}
        <div>
          {profile.posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            profile.posts.map((post) => {
              const visibleComments = post.comments.slice(0, 2);
              const hasMore = post.comments.length > 2;

              return (
                <div
                  key={post.id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{ marginBottom: "10px", cursor: "pointer", color: "blue" }}
                    onClick={() => navigate(`/profile/${profile.username}`)}
                  >
                    <strong>{profile.username}</strong>
                  </div>

                  <div style={{ marginBottom: "10px" }}>{post.content}</div>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="post"
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                  )}

                  <div style={{ marginBottom: "10px" }}>
                    <button onClick={() => toggleLike(post.id)}>
                      Like ({post.likes.length})
                    </button>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    {visibleComments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          borderTop: "1px solid #eee",
                          padding: "5px 0",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <strong
                            style={{ color: "blue", cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${comment.username}`)}
                          >
                            {comment.username}
                          </strong>
                          : {comment.text}
                        </div>
                        {(comment.username === currentUser || isOwnProfile) && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "red",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {hasMore && (
                      <div
                        style={{ textAlign: "center", cursor: "pointer", color: "gray" }}
                        onClick={() => navigate(`/comments/${post.id}`)}
                      >
                        ...
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="Add comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) =>
                        setCommentText({ ...commentText, [post.id]: e.target.value })
                      }
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => addComment(post.id)}>Post</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

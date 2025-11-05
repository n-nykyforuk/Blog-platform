import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const defaultAvatar = "/uploads/default.jpg";

  const fetchCurrentProfile = async () => {
    try {
      if (!username) return;
      const res = await fetch(`/api/users/${username}/profile`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      if (data?.avatarUrl) localStorage.setItem("avatarUrl", data.avatarUrl);
    } catch (err) {
      console.error("fetchCurrentProfile error:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("fetchPosts error:", err);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories/following", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) {
        setStories([]);
        return;
      }
      const data = await res.json();
      const now = Date.now();

      // Фільтруємо активні сторіси (24 години)
      const filtered = data.filter((s) => {
        try {
          const created = Date.parse(s.createdAt + "Z");
          return now - created <= 24 * 60 * 60 * 1000;
        } catch {
          return false;
        }
      });

      setStories(filtered);
    } catch (err) {
      console.error("fetchStories error:", err);
      setStories([]);
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
    fetchPosts();
    fetchStories();
  }, []);

  // === Build list of users who have stories ===
  const storyUsers = React.useMemo(() => {
    const map = new Map();

    for (const s of stories) {
      const user = s.username;
      const avatar = s.avatarUrl || defaultAvatar;
      if (!user) continue;
      if (!map.has(user)) {
        map.set(user, { username: user, avatarUrl: avatar });
      }
    }

    // Include "You" at the start if you have a story
    const hasMyStory = stories.some((s) => s.username === username);
    if (hasMyStory) {
      map.delete(username);
      map.set(username, {
        username,
        avatarUrl: profile?.avatarUrl || localStorage.getItem("avatarUrl") || defaultAvatar,
      });
    }

    return Array.from(map.values());
  }, [stories, profile, username]);

  const getBorderStyle = (user) => {
    const viewed = JSON.parse(localStorage.getItem("viewedStories") || "[]");
    const hasStory = stories.some((s) => s.username === user);
    if (!hasStory) return "3px solid transparent";
    return viewed.includes(user) ? "3px solid #aaa" : "3px solid #ff006e";
  };

  const handleAvatarClick = (user) => {
    const hasStory = stories.some((s) => s.username === user);
    if (hasStory) navigate(`/stories/view/${user}`);
    else navigate(`/profile/${user}`);
  };

  const handleAddStory = (e) => {
    e.stopPropagation();
    navigate("/stories/create");
  };

  const toggleLike = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      fetchPosts();
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
      fetchPosts();
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
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        {/* STORIES BAR */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "15px",
            padding: "10px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          {/* MY STORY */}
          <div
            style={{ textAlign: "center", position: "relative", cursor: "pointer" }}
            onClick={() => handleAvatarClick(username)}
          >
            <div
              style={{
                border: getBorderStyle(username),
                borderRadius: "50%",
                padding: "3px",
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
              }}
            >
              <img
                src={profile?.avatarUrl || defaultAvatar}
                alt="me"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <span
              onClick={handleAddStory}
              style={{
                position: "absolute",
                bottom: 2,
                right: 8,
                background: "#007bff",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "14px",
                border: "2px solid white",
                cursor: "pointer",
              }}
            >
              +
            </span>
            <div style={{ fontSize: 12, marginTop: 6 }}>You</div>
          </div>

          {/* OTHER USERS */}
          {storyUsers
            .filter((u) => u.username !== username)
            .map((u) => (
              <div
                key={u.username}
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={() => handleAvatarClick(u.username)}
              >
                <div
                  style={{
                    border: getBorderStyle(u.username),
                    borderRadius: "50%",
                    padding: "3px",
                    width: "64px",
                    height: "64px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                  }}
                >
                  <img
                    src={u.avatarUrl || defaultAvatar}
                    alt={u.username}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>{u.username}</div>
              </div>
            ))}
        </div>

        {/* POSTS */}
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div
                style={{
                  border: getBorderStyle(post.user.username),
                  borderRadius: "50%",
                  padding: "2px",
                  display: "inline-block",
                  cursor: "pointer",
                }}
                onClick={() => handleAvatarClick(post.user.username)}
              >
                <img
                  src={post.user.avatarUrl || defaultAvatar}
                  alt="avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <strong
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => navigate(`/profile/${post.user.username}`)}
              >
                {post.user.username}
              </strong>
            </div>

            <div style={{ marginBottom: "10px" }}>{post.content}</div>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="post"
                style={{ width: "100%", borderRadius: 6, marginBottom: 10 }}
              />
            )}

            <div style={{ marginBottom: "10px" }}>
              <button onClick={() => toggleLike(post.id)}>
                ❤️ Like ({post.likes.length})
              </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
              {post.comments.slice(0, 2).map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    borderTop: "1px solid #eee",
                    padding: "5px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={comment.user?.avatarUrl || defaultAvatar}
                      alt="avatar"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onClick={() => handleAvatarClick(comment.user.username)}
                    />
                    <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${comment.user.username}`)}
                    >
                      <strong>{comment.user.username}</strong>
                    </span>
                    <span style={{ marginLeft: "5px" }}>{comment.text}</span>
                  </div>

                  {(comment.user.username === username || post.user.username === username) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "red",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              {post.comments.length > 2 && (
                <div
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    color: "gray",
                    marginTop: 5,
                  }}
                  onClick={() => navigate(`/comments/${post.id}`)}
                >
                  ...
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
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
        ))}
      </div>
    </>
  );
}

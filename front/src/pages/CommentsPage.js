import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CommentsPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [userStories, setUserStories] = useState({});
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const defaultAvatar = "/uploads/default.jpg";
  const viewedStories = JSON.parse(localStorage.getItem("viewedStories") || "[]");

  // --- Завантажити пост ---
  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) {
        console.error("Failed to load post:", res.status);
        return;
      }
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Завантажити сторіс користувача ---
  const fetchUserStories = async (username) => {
    try {
      const res = await fetch(`/api/stories/${username}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const data = await res.json();
        setUserStories((prev) => ({ ...prev, [username]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // --- Коли пост завантажився, підтягуємо сторіс автора + коментаторів ---
  useEffect(() => {
    if (post) {
      const usernames = new Set();
      if (post.user?.username) usernames.add(post.user.username);
      post.comments?.forEach((c) => {
        if (c.user?.username) usernames.add(c.user.username);
      });
      usernames.forEach((u) => fetchUserStories(u));
    }
  }, [post]);

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      await fetch(`/api/posts/post/${postId}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText("");
      fetchPost();
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
      if (res.ok) fetchPost();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Рендер аватарки з підсвіткою ---
  const renderAvatar = (user) => {
    const userName = user?.username;
    const stories = userStories[userName] || [];
    const hasStories = stories.length > 0;
    const isViewed = viewedStories.includes(userName);

    return (
      <img
        src={user?.avatarUrl || defaultAvatar}
        alt="avatar"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          objectFit: "cover",
          border: hasStories
            ? isViewed
              ? "2px solid gray"
              : "2px solid deeppink"
            : "none",
          padding: hasStories ? "2px" : "0",
          cursor: hasStories ? "pointer" : "default",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasStories) navigate(`/stories/view/${userName}`);
        }}
      />
    );
  };

  if (!post) return <div>Loading comments...</div>;

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h2 style={{ marginBottom: "10px" }}>
          Comments for Post by {post.user?.username || "Unknown"}
        </h2>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          {/* --- Автор поста --- */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/profile/${post.user?.username}`)}
          >
            {renderAvatar(post.user)}
            <strong style={{ color: "blue" }}>{post.user?.username}</strong>
          </div>

          <div style={{ marginBottom: "10px" }}>{post.content}</div>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="post"
              style={{
                width: "100%",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            />
          )}

          {/* --- Коментарі --- */}
          <div>
            {post.comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              post.comments.map((comment) => {
                const commentAuthor =
                  comment.user?.username || comment.username || "Unknown";
                return (
                  <div
                    key={comment.id}
                    style={{
                      borderTop: "1px solid #eee",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {renderAvatar(comment.user)}
                      <span
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${commentAuthor}`)}
                      >
                        <strong>{commentAuthor}</strong>
                      </span>
                      <span style={{ marginLeft: "5px" }}>{comment.text}</span>
                    </div>

                    {(commentAuthor === username ||
                      post.user?.username === username) && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "red",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* --- Поле для додавання коментаря --- */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={addComment}>Post</button>
          </div>
        </div>
      </div>
    </>
  );
}

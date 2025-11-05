import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function FollowingPage() {
  const { username } = useParams();
  const [following, setFollowing] = useState([]);
  const [userStories, setUserStories] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const viewedStories = JSON.parse(localStorage.getItem("viewedStories") || "[]");

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await fetch(`/api/users/${username}/following`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setFollowing(data);
        data.forEach((u) => fetchUserStories(u.username));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowing();
  }, [username, token]);

  const fetchUserStories = async (user) => {
    try {
      const res = await fetch(`/api/stories/${user}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        const stories = await res.json();
        setUserStories((prev) => ({ ...prev, [user]: stories }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderAvatar = (user) => {
    const stories = userStories[user.username] || [];
    const hasStories = stories.length > 0;
    const isViewed = viewedStories.includes(user.username);

    return (
      <img
        src={user.avatarUrl || "/default.jpg"}
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
          e.preventDefault();
          if (hasStories) navigate(`/stories/view/${user.username}`);
        }}
      />
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "0 10px" }}>
        <h2>{username} is Following</h2>
        {following.length === 0 ? (
          <p>{username} is not following anyone yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {following.map((u) => (
              <li
                key={u.id}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {renderAvatar(u)}
                <Link
                  to={`/profile/${u.username}`}
                  style={{ textDecoration: "none", color: "blue" }}
                >
                  {u.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

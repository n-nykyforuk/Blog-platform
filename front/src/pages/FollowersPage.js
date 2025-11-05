import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function FollowersPage() {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [userStories, setUserStories] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const viewedStories = JSON.parse(localStorage.getItem("viewedStories") || "[]");

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch(`/api/users/${username}/followers`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        setFollowers(data);
        data.forEach((f) => fetchUserStories(f.username));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowers();
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
        <h2>{username}'s Followers</h2>
        {followers.length === 0 ? (
          <p>No followers yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {followers.map((f) => (
              <li
                key={f.id}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {renderAvatar(f)}
                <Link
                  to={`/profile/${f.username}`}
                  style={{ textDecoration: "none", color: "blue" }}
                >
                  {f.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

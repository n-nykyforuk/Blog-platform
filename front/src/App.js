import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FeedPage from "./pages/FeedPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import CommentsPage from "./pages/CommentsPage";
import ChatPage from "./pages/ChatPage"; // ✅ нова сторінка
import ListChatPage from "./pages/ListChatPage";
import CreateStoryPage from "./pages/CreateStoryPage";
import ViewStoryPage from "./pages/ViewStoryPage";

function App() {
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setTokenValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/posts", {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) setTokenValid(true);
        else {
          localStorage.removeItem("token");
          setTokenValid(false);
        }
      } catch {
        localStorage.removeItem("token");
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={tokenValid ? <Navigate to="/feed" /> : <Navigate to="/login" />} />
        <Route path="/login" element={tokenValid ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/register" element={tokenValid ? <Navigate to="/feed" /> : <Register />} />
        <Route path="/feed" element={tokenValid ? <FeedPage /> : <Navigate to="/login" />} />
        <Route path="/create-post" element={tokenValid ? <CreatePostPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={tokenValid ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username/followers" element={tokenValid ? <FollowersPage /> : <Navigate to="/login" />} />
        <Route path="/profile/:username/following" element={tokenValid ? <FollowingPage /> : <Navigate to="/login" />} />
        <Route path="/comments/:postId" element={tokenValid ? <CommentsPage /> : <Navigate to="/login" />} />
        <Route path="/search" element={tokenValid ? <SearchPage /> : <Navigate to="/login" />} />
        <Route path="/chat/:chatId" element={tokenValid ? <ChatPage /> : <Navigate to="/login" />} /> {/* 🆕 */}
        <Route path="/chats" element={<ListChatPage />} />
        <Route path="/stories/create" element={<CreateStoryPage />} />
        <Route path="/stories/view/:username" element={<ViewStoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;

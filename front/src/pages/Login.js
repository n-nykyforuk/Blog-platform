import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }

      const data = await res.json();

      // ✅ Зберігаємо дані користувача в localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      if (data.id) {
        localStorage.setItem("userId", data.id); // 👈 потрібно для WebSocket
      }

      navigate("/"); // перенаправлення після логіну
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">Blog-platform</h1>
      <div className="auth-card">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="usernameOrEmail"
            placeholder="Username or Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Sign in</button>
        </form>
        <p className="switch-text">
          New here?{" "}
          <span
            onClick={() => navigate("/register")}
            className="switch-link"
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

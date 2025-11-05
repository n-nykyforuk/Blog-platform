import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Registration successful! Now you can sign in.");
        navigate("/login");
      } else {
        const errMsg = await res.text();
        alert(errMsg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">Blog-platform</h1>
      <div className="auth-card">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Sign up</button>
        </form>
        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="switch-link">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authApi.post("/api/auth/register", form);
      setSuccess("Registration successful. You can now log in.");
      setTimeout(() => navigate("/login?role=consumer"), 700);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Logo />
        <p className="tagline">SCAN. CHECK. COMPLY.</p>
        <h1>Create Consumer Account</h1>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required />

          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />

          <label>Password</label>
          <input type="password" minLength="6" value={form.password} onChange={(e) => update("password", e.target.value)} required />

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <button className="primary-btn full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="auth-link">
          Already registered? <Link to="/login?role=consumer">Login</Link>
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api";
import demoUsers from "../authUsers";
import { saveSession } from "../auth";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedRole = params.get("role") || "consumer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (selectedRole !== "consumer") {
        const demo = demoUsers.find(
          (u) =>
            u.role === selectedRole &&
            u.email.toLowerCase() === email.trim().toLowerCase() &&
            u.password === password
        );

        if (!demo) {
          throw new Error("Invalid demo credentials for this role.");
        }

        saveSession({ user: demo });

        navigate(
          selectedRole === "government" ? "/government" : "/manufacturer"
        );
        return;
      }

      const response = await authApi.post("/api/auth/login", {
        email,
        password,
      });

      saveSession({
        token: response.data.token,
        user: response.data.user,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Logo />
        <p className="tagline">SCAN. CHECK. COMPLY.</p>

        <h1>{selectedRole === "consumer" ? "Consumer Login" :
          selectedRole === "government" ? "Government Authority Login" :
          "Product Owner Login"}</h1>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div className="error-box">{error}</div>}

          <button className="primary-btn full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {selectedRole === "consumer" && (
          <p className="auth-link">
            New consumer? <Link to="/register">Create an account</Link>
          </p>
        )}

        <button className="back-link" onClick={() => navigate("/")}>
          ← Change role
        </button>
      </div>
    </div>
  );
}

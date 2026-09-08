import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import authUsers from "../authUsers";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // Product Owner / Government demo login
    const demoUser = authUsers.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (demoUser) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", demoUser.role);
      localStorage.setItem("userId", demoUser.id);
      localStorage.setItem("userName", demoUser.name);
      localStorage.setItem("userEmail", demoUser.email);

      if (demoUser.role === "product-owner") {
        navigate("/manufacturer");
      } else if (demoUser.role === "government") {
        navigate("/government");
      }

      return;
    }

    // Consumer login
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Invalid email or password");
        return;
      }

      // Save login information
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      alert("Login successful!");

      // Consumer dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      alert("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <Logo size="large" />

        <h1>Welcome to NiyamNetra</h1>

        <p className="auth-subtitle">
          Login to continue
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
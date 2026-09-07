import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role") || "consumer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // Mock login for prototype
    if (email && password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);

      if (role === "product-owner") {
        navigate("/manufacturer");
      } else if (role === "government") {
        navigate("/government");
      } else {
        navigate("/dashboard");
      }
    } else {
      alert("Please enter email and password");
    }
  }

  const roleNames = {
    consumer: "Consumer",
    "product-owner": "Product Owner",
    government: "Government Authority",
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>PackSure</h1>

        <p className="auth-subtitle">
          Product Compliance Checker
        </p>

        <h2>Welcome Back</h2>

        <p>
          Login as <strong>{roleNames[role]}</strong>
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
          >
            Login
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
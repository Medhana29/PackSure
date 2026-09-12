import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="role-shell">
        <Logo />
        <p className="tagline">SCAN. CHECK. COMPLY.</p>
        <h1>Choose how you want to use NiyamNetra</h1>
        <p className="muted">Select your role to continue.</p>

        <div className="role-grid">
          <button onClick={() => navigate("/login?role=consumer")} className="role-card">
            <span>🛒</span>
            <h2>Consumer</h2>
            <p>Inspect packaged products and view your inspection history.</p>
          </button>

          <button onClick={() => navigate("/login?role=product-owner")} className="role-card">
            <span>🏭</span>
            <h2>Product Owner</h2>
            <p>View product compliance information for your products.</p>
          </button>

          <button onClick={() => navigate("/login?role=government")} className="role-card">
            <span>⚖️</span>
            <h2>Government Authority</h2>
            <p>Review inspections and compliance findings.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

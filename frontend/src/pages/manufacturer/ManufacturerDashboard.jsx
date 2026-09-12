import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";

export default function ManufacturerDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="page">
        <p className="eyebrow">PRODUCT OWNER</p>
        <h1>Manufacturer Dashboard</h1>
        <p className="muted">Demo dashboard for product-owner presentation flow.</p>

        <div className="stats-grid">
          <StatCard title="Products" value="Demo" subtitle="Connect product database later" />
          <StatCard title="Compliance" value="Review" subtitle="Use inspection evidence" />
          <StatCard title="Alerts" value="0" subtitle="No live alerts connected" />
        </div>

        <section className="panel">
          <h2>Product owner workspace</h2>
          <p>This account uses the five-account presentation dataset requested for the prototype.</p>
          <button className="primary-btn" onClick={() => navigate("/")}>Back to roles</button>
        </section>
      </main>
    </>
  );
}

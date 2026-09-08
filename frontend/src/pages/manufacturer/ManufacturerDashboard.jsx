import React from "react";
import Logo from "../../components/Logo";
import StatCard from "../../components/StatCard";
import "../../manufacturer.css";

const ManufacturerDashboard = () => {
  const stats = [
    { title: "Total Scans", value: 128 },
    { title: "Compliant", value: 96, type: "compliant" },
    { title: "Issues Found", value: 24, type: "issues" },
    { title: "Pending Review", value: 8, type: "review" },
  ];

  return (
    <div className="manufacturer-page">

      {/* HEADER / NAVBAR */}
      <header className="dashboard-navbar">
        <div className="dashboard-navbar-logo">
          <Logo size="navbar-logo-size" />
        </div>

        <div className="dashboard-navbar-title">
          <span>Product Owner Portal</span>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="dashboard-content">

        <section className="dashboard-header">
          <div>
            <h1>Product Owner Dashboard</h1>
            <p>
              Monitor product inspections and compliance status.
            </p>
          </div>
        </section>

        <section className="manufacturer-stats">
          {stats.map((stat, index) => (
            <div
              className={`manufacturer-stat ${stat.type || ""}`}
              key={index}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
              />
            </div>
          ))}
        </section>

      </main>
    </div>
  );
};

export default ManufacturerDashboard;
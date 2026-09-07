import React from "react";
import StatCard from "../../components/StatCard";
import "../../manufacturer.css";

const ManufacturerDashboard = () => {
  const stats = [
    { title: "Total Products", value: 128 },
    { title: "Compliant", value: 96 },
    { title: "Issues Found", value: 24 },
    { title: "Pending Review", value: 8 },
  ];

  return (
  <div className="manufacturer-page">

    <div className="dashboard-header">
      <div>
        <h1>Product Owner Dashboard</h1>
        <p>Monitor your product compliance status</p>
      </div>
    </div>

    <div className="manufacturer-stats">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>

    <div className="dashboard-section">
      <h2>Compliance Overview</h2>

      <div className="overview-card">
        <div>
          <h3>96</h3>
          <p>Products are currently compliant</p>
        </div>

        <div>
          <h3>24</h3>
          <p>Products have issues</p>
        </div>

        <div>
          <h3>8</h3>
          <p>Products awaiting review</p>
        </div>
      </div>
    </div>

  </div>
);
};

export default ManufacturerDashboard;
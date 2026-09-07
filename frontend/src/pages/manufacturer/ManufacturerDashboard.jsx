import React from "react";
import StatCard from "../../components/StatCard";

const ManufacturerDashboard = () => {
  const stats = [
    { title: "Total Products", value: 128 },
    { title: "Compliant", value: 96 },
    { title: "Issues Found", value: 24 },
    { title: "Pending Review", value: 8 },
  ];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manufacturer Dashboard</h2>

      <div className="row">
        {stats.map((stat, index) => (
          <div className="col-md-3 mb-4" key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
import React from "react";
export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}

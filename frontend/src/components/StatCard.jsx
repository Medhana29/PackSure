import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="card h-100">
      <div className="card-body">

        <h6
          style={{
            color: "#64748B",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {title}
        </h6>

        <h2
          style={{
            color: "#12343B",
            fontSize: "30px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          {value}
        </h2>

      </div>
    </div>
  );
};

export default StatCard;
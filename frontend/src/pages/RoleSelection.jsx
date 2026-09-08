import React from "react";
import { useNavigate } from "react-router-dom";
import "../roleSelection.css";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Consumer",
      description: "Scan and check packaged products",
      role: "consumer",
    },
    {
      title: "Product Owner",
      description: "Manage products and compliance",
      role: "product-owner",
    },
    {
      title: "Government Authority",
      description: "Review products and violations",
      role: "government",
    },
  ];

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="role-page">
      <div className="role-container">
        <h1>Welcome to PackSure</h1>

        <p className="role-subtitle">
          Select your role to continue
        </p>

        <div className="role-cards">
          {roles.map((role) => (
            <div className="role-card" key={role.role}>
              <h2>{role.title}</h2>

              <p>{role.description}</p>

              <button
                onClick={() => handleRoleSelect(role.role)}
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
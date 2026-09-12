import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { logout } from "../auth";

export default function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("userName") || "User";
  const role = localStorage.getItem("userRole") || "consumer";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <div className="top-notification">
        <span>●</span> NiyamNetra helps identify missing packaged-commodity declarations.
      </div>

      <nav className="navbar">
        <Logo />
        <div className="nav-right">
          <span className="nav-user">{name}</span>
          <span className="role-pill">{role}</span>
          <button className="ghost-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    </>
  );
}

import React from "react";
import logo from "../assets/NiyamNetra.png";
import "../logo.css";

function Logo({ size = "normal" }) {
  return (
    <div className={`niyamnetra-logo ${size}`}>
      <img src={logo} alt="NiyamNetra" />
    </div>
  );
}

export default Logo;
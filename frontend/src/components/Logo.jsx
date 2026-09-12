import React from "react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark">N</span>
      <span className="logo-text">Niyam<span>Netra</span></span>
    </Link>
  );
}

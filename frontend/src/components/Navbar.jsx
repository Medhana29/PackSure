import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <Link to="/dashboard">
          PackSure
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/search">Search</Link>
        <Link to="/inspection">New Scan</Link>
        <Link to="/history">History</Link>
      </div>

      <Link to="/login" className="logout-btn">
        Logout
      </Link>

    </nav>
  );
}

export default Navbar;
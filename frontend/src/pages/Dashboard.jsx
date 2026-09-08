import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScanCard from "../components/ScanCard";

function Dashboard() {
  const navigate = useNavigate();

  const [notification] = useState(
    JSON.parse(localStorage.getItem("governmentNotification")) || null
  );

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Main Dashboard */}
      <main className="page-container">

        {/* Dashboard Header */}
        <section className="dashboard-header">
          <div>
            <p>
              Check whether packaged products follow Legal Metrology
              requirements.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/inspection")}
          >
            + New Inspection
          </button>
        </section>

        {/* Scan Product */}
        <ScanCard />

        {/* Notifications */}
        <section className="notification-section">
          <div className="notification-header">
            <h2>🔔 Notifications</h2>
          </div>

          {notification ? (
            <div className="notification-card">
              <div className="notification-icon">
                🏛️
              </div>

              <div className="notification-content">
                <h3>Government Authority</h3>

                <p>{notification.message}</p>

                <strong>
                  Status: {notification.status}
                </strong>

                <small>
                  {notification.date}
                </small>
              </div>
            </div>
          ) : (
            <div className="no-notification">
              <p>No new notifications</p>
            </div>
          )}
        </section>

        {/* Dashboard Options */}
        <section className="dashboard-grid">

          {/* Search Products */}
          <div
            className="dashboard-box"
            onClick={() => navigate("/search")}
          >
            <span className="dashboard-icon">
              🔍
            </span>

            <h3>Search Products</h3>

            <p>
              Search previously inspected products.
            </p>
          </div>

          {/* Inspection History */}
          <div
            className="dashboard-box"
            onClick={() => navigate("/history")}
          >
            <span className="dashboard-icon">
              📋
            </span>

            <h3>Inspection History</h3>

            <p>
              View your previous inspections.
            </p>
          </div>

          {/* Legal Metrology */}
          <div className="dashboard-box">
            <span className="dashboard-icon">
              ⚖️
            </span>

            <h3>Legal Metrology</h3>

            <p>
              Verify mandatory declarations on packaged
              commodities.
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;
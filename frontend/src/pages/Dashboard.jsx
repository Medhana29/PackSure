import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScanCard from "../components/ScanCard";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>

      <Navbar />

      <main className="page-container">

        <section className="dashboard-header">

          <div>
            <h1>Consumer Dashboard</h1>

            <p>
              Check whether packaged products follow
              Legal Metrology requirements.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/inspection")}
          >
            + New Inspection
          </button>

        </section>

        <ScanCard />

        <section className="dashboard-grid">

          <div
            className="dashboard-box"
            onClick={() => navigate("/search")}
          >
            <span>🔍</span>

            <h3>Search Products</h3>

            <p>
              Search previously inspected products.
            </p>
          </div>

          <div
            className="dashboard-box"
            onClick={() => navigate("/history")}
          >
            <span>📋</span>

            <h3>Inspection History</h3>

            <p>
              View your previous inspections.
            </p>
          </div>

          <div className="dashboard-box">

            <span>⚖️</span>

            <h3>Legal Metrology</h3>

            <p>
              Verify mandatory declarations on packaged commodities.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
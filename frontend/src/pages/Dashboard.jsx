import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");
  const historyKey = `scanHistory_${userEmail}`;

  const history = JSON.parse(
    localStorage.getItem(historyKey) || "[]"
  );

  const compliant = history.filter(
    (x) =>
      x.compliance_check?.overall_status ===
      "POTENTIALLY_COMPLIANT"
  ).length;

  return (
    <>
      <Navbar />

      <main className="page">

        <section className="hero-row">
          <div>
            <p className="eyebrow">CONSUMER DASHBOARD</p>

            <h1>
              Check packaged products with confidence.
            </h1>

            <p className="muted">
              Scan the front and back of a package to extract
              declarations and run the NiyamNetra compliance checks.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/inspection")}
          >
            + New Inspection
          </button>
        </section>

        <div className="stats-grid">

          <StatCard
            title="Total inspections"
            value={history.length}
            subtitle="Actual scans saved"
          />

          <StatCard
            title="Potentially compliant"
            value={compliant}
            subtitle="Based on current rules"
          />

          <StatCard
            title="Searchable products"
            value={
              new Set(
                history.map((x) => x.productName)
              ).size
            }
            subtitle="From your scans"
          />

        </div>

        <section className="dashboard-grid">

          <button
            className="dashboard-box"
            onClick={() => navigate("/inspection")}
          >
            <span>📷</span>
            <h3>New Inspection</h3>
            <p>
              Upload front and back package images.
            </p>
          </button>

          <button
            className="dashboard-box"
            onClick={() => navigate("/search")}
          >
            <span>🔎</span>
            <h3>Search Products</h3>
            <p>
              Search products from your real scan history.
            </p>
          </button>

          <button
            className="dashboard-box"
            onClick={() => navigate("/history")}
          >
            <span>📋</span>
            <h3>Inspection History</h3>
            <p>
              Open previous OCR and compliance results.
            </p>
          </button>

        </section>

      </main>
    </>
  );
}
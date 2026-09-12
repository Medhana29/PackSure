import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import RiskBadge from "../components/RiskBadge";

export default function History() {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");
  const historyKey = `scanHistory_${userEmail}`;

  const history = [
    ...JSON.parse(localStorage.getItem(historyKey) || "[]"),
  ].reverse();

  function open(item) {
    localStorage.setItem(
      "scanResult",
      JSON.stringify(item)
    );

    navigate("/results");
  }

  function deleteScan(e, inspectionId) {
    // Stop the card from opening the result
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this inspection?"
    );

    if (!confirmed) {
      return;
    }

    const currentHistory = JSON.parse(
      localStorage.getItem(historyKey) || "[]"
    );

    const updatedHistory = currentHistory.filter(
      (item) => item.inspectionId !== inspectionId
    );

    localStorage.setItem(
      historyKey,
      JSON.stringify(updatedHistory)
    );

    // If the deleted scan is currently open as the result,
    // remove it from current result too.
    const currentResult = JSON.parse(
      localStorage.getItem("scanResult") || "null"
    );

    if (currentResult?.inspectionId === inspectionId) {
      localStorage.removeItem("scanResult");
    }

    // Refresh the page so the deleted item disappears immediately
    window.location.reload();
  }

  return (
    <>
      <Navbar />

      <main className="page">

        <div className="hero-row">

          <div>
            <p className="eyebrow">
              REAL SCAN HISTORY
            </p>

            <h1>
              Inspection History
            </h1>

            <p className="muted">
              These entries come from scans you actually performed.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/inspection")}
          >
            + New Inspection
          </button>

        </div>

        {history.length === 0 ? (

          <div className="empty-state">

            <h2>
              No inspections yet
            </h2>

            <p>
              Run your first scan and it will appear here automatically.
            </p>

          </div>

        ) : (

          <div className="history-list">

            {history.map((item) => (

              <div
                className="history-card"
                key={item.inspectionId}
              >

                <button
                  className="history-card-content"
                  onClick={() => open(item)}
                >

                  <div>

                    <p className="eyebrow">
                      {item.inspectionId}
                    </p>

                    <h3>
                      {item.productName}
                    </h3>

                    <small>
                      {item.date}
                    </small>

                  </div>

                  <div className="badge-row">

                    <StatusBadge
                      status={item.status}
                    />

                    <RiskBadge
                      risk={item.risk}
                    />

                  </div>

                </button>

                <button
                  className="delete-btn"
                  onClick={(e) =>
                    deleteScan(
                      e,
                      item.inspectionId
                    )
                  }
                >
                  🗑 Delete
                </button>

              </div>

            ))}

          </div>

        )}

      </main>
    </>
  );
}
import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import StatCard from "../../components/StatCard";

export default function GovernmentDashboard() {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD REAL INSPECTIONS FROM BACKEND
  // ============================================================

  useEffect(() => {
    loadInspections();
  }, []);

  async function loadInspections() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8001/api/inspections"
      );

      if (!response.ok) {
        throw new Error("Could not load inspections");
      }

      const data = await response.json();

      setInspections(data);
    } catch (err) {
      console.error("Government inspection error:", err);
      setError("Could not load inspection records.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // AUTHORITY DECISION
  // ============================================================

  async function handleDecision(id, decision) {
    try {
      const response = await fetch(
        `http://localhost:8001/api/inspections/${id}/decision`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            decision: decision,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not update authority decision");
      }

      // Update screen immediately
      setInspections((current) =>
        current.map((item) =>
          item.inspection_id === id
            ? {
                ...item,
                authority_status: decision,
              }
            : item
        )
      );

      setSelectedInspection(null);

    } catch (err) {
      console.error("Authority decision error:", err);
      alert("Could not save authority decision.");
    }
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const pendingCount = inspections.filter(
    (item) =>
      item.authority_status === "UNDER_REVIEW"
  ).length;

  const highRiskCount = inspections.filter(
    (item) =>
      String(
        item.compliance_check?.risk_level || ""
      ).toUpperCase() === "HIGH"
  ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page">
          <p className="eyebrow">
            GOVERNMENT AUTHORITY
          </p>

          <h1>Government Dashboard</h1>

          <p className="muted">
            Loading inspection records...
          </p>
        </main>
      </>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <>
      <Navbar />

      <main className="page">

        <p className="eyebrow">
          GOVERNMENT AUTHORITY
        </p>

        <h1>
          Government Dashboard
        </h1>

        <p className="muted">
          Review non-compliant product inspections
          submitted by consumers.
        </p>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="notice-box">
            {error}
          </div>
        )}


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="stats-grid">

          <StatCard
            title="Non-compliant inspections"
            value={inspections.length}
            subtitle="Cases submitted for review"
          />

          <StatCard
            title="Pending reviews"
            value={pendingCount}
            subtitle="Awaiting authority decision"
          />

          <StatCard
            title="High risk"
            value={highRiskCount}
            subtitle="Cases requiring attention"
          />

        </div>


        {/* =====================================================
            INSPECTION QUEUE
        ===================================================== */}

        <section className="panel">

          <h2>
            Inspection Review Queue
          </h2>

          <p className="muted">
            Only non-compliant products are shown here.
          </p>


          {inspections.length === 0 ? (

            <div className="empty-state">

              <h3>
                No inspections pending
              </h3>

              <p>
                Non-compliant consumer scans will
                appear here for authority review.
              </p>

            </div>

          ) : (

            <div className="government-table">

              {inspections.map((item) => {

                const compliance =
                  item.compliance_check || {};

                const risk =
                  String(
                    compliance.risk_level || "UNKNOWN"
                  ).toUpperCase();

                const status =
                  String(
                    item.authority_status ||
                    "UNDER_REVIEW"
                  ).toUpperCase();

                return (

                  <div
                    className="government-row"
                    key={item.inspection_id}
                  >

                    {/* PRODUCT */}

                    <div>

                      <strong>
                        {item.product_name}
                      </strong>

                      <p className="muted">
                        {item.inspection_id}
                      </p>

                      <p className="muted">
                        Consumer:{" "}
                        {item.consumer_email}
                      </p>

                    </div>


                    {/* COMPLIANCE */}

                    <div>

                      <strong>
                        NON-COMPLIANT
                      </strong>

                      <p className="muted">
                        Risk: {risk}
                      </p>

                    </div>


                    {/* AUTHORITY STATUS */}

                    <div>

                      <span
                        className={
                          status === "UNDER_REVIEW"
                            ? "risk-medium"
                            : status === "ACCEPTED"
                            ? "risk-low"
                            : "risk-high"
                        }
                      >
                        {status}
                      </span>

                    </div>


                    {/* ACTION */}

                    <div>

                      {status === "UNDER_REVIEW" ? (

                        <button
                          className="secondary-btn"
                          onClick={() =>
                            setSelectedInspection(item)
                          }
                        >
                          Review
                        </button>

                      ) : (

                        <span className="authority-decision">
                          {status === "ACCEPTED"
                            ? "✓ ACCEPTED"
                            : "✕ REJECTED"}
                        </span>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </section>


        {/* =====================================================
            REVIEW PANEL
        ===================================================== */}

        {selectedInspection && (

          <section className="panel review-panel">

            <p className="eyebrow">
              AUTHORITY REVIEW
            </p>

            <h2>
              Review Inspection
            </h2>

            <p className="muted">
              Inspection ID:{" "}
              {selectedInspection.inspection_id}
            </p>


            <div className="review-details">

              <div>
                <strong>Product</strong>

                <p>
                  {selectedInspection.product_name}
                </p>
              </div>


              <div>
                <strong>Consumer</strong>

                <p>
                  {selectedInspection.consumer_email}
                </p>
              </div>


              <div>
                <strong>Compliance</strong>

                <p>
                  NON-COMPLIANT
                </p>
              </div>


              <div>
                <strong>Risk Level</strong>

                <p>
                  {String(
                    selectedInspection
                      .compliance_check
                      ?.risk_level ||
                    "UNKNOWN"
                  ).toUpperCase()}
                </p>
              </div>


              <div>
                <strong>Net Quantity</strong>

                <p>
                  {selectedInspection
                    .declarations
                    ?.net_quantity || "Not detected"}
                </p>
              </div>


              <div>
                <strong>MRP</strong>

                <p>
                  {selectedInspection
                    .declarations
                    ?.mrp || "Not detected"}
                </p>
              </div>


              <div>
                <strong>Manufacturer</strong>

                <p>
                  {selectedInspection
                    .declarations
                    ?.manufacturer || "Not detected"}
                </p>
              </div>


              <div>
                <strong>Consumer Care</strong>

                <p>
                  {selectedInspection
                    .declarations
                    ?.consumer_care || "Not detected"}
                </p>
              </div>

            </div>


            {/* =================================================
                DECISION BUTTONS
            ================================================= */}

            <div className="review-actions">

              <button
                className="primary-btn"
                onClick={() =>
                  handleDecision(
                    selectedInspection.inspection_id,
                    "ACCEPTED"
                  )
                }
              >
                ✓ Accept
              </button>


              <button
                className="reject-btn"
                onClick={() =>
                  handleDecision(
                    selectedInspection.inspection_id,
                    "REJECTED"
                  )
                }
              >
                ✕ Reject
              </button>


              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedInspection(null)
                }
              >
                Cancel
              </button>

            </div>

          </section>

        )}

      </main>
    </>
  );
}
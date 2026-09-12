import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import RiskBadge from "../components/RiskBadge";

// ============================================================
// NIYAMNETRA CONFIGURED DECLARATIONS
// ONLY THESE 6 FIELDS ARE COUNTED
// ============================================================

const fields = [
  ["product_name", "Product Name"],
  ["manufacturer", "Manufacturer"],
  ["net_quantity", "Net Quantity"],
  ["mrp", "MRP"],
  ["manufacturing_date", "Manufacturing / Packing Date"],
  ["consumer_care", "Consumer Care"],
];

export default function Report() {
  const navigate = useNavigate();

  const result = JSON.parse(
    localStorage.getItem("scanResult") || "null"
  );

  // ==========================================================
  // NO REPORT
  // ==========================================================

  if (!result) {
    return (
      <>
        <Navbar />

        <main className="page">
          <section className="panel">
            <h1>No report available</h1>

            <p className="muted">
              Please scan a product first to view the report.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/new-inspection")}
            >
              Start New Inspection
            </button>
          </section>
        </main>
      </>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const declarations = result.declarations || {};
  const compliance = result.compliance_check || {};

  // ==========================================================
  // GET DECLARATION VALUE
  // ==========================================================

  const getDeclarationValue = (key) => {
    if (key === "product_name") {
      return (
        result.productName ||
        declarations.product_name ||
        null
      );
    }

    return declarations[key] || null;
  };

  // ==========================================================
  // CHECK WHETHER DECLARATION EXISTS
  // ==========================================================

  const isDetected = (key) => {
    const value = getDeclarationValue(key);

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  };

  // ==========================================================
  // DETECTED COUNT
  // ==========================================================

  const detectedCount = fields.filter(
    ([key]) => isDetected(key)
  ).length;

  const totalConfigured = fields.length;

  // ==========================================================
  // MISSING DECLARATIONS
  // ==========================================================

  const missingDeclarations = fields.filter(
    ([key]) => !isDetected(key)
  );

  // ==========================================================
  // PRODUCT NAME
  // ==========================================================

  const productName =
    result.productName ||
    declarations.product_name ||
    "Unknown Product";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Navbar />

      <main className="page narrow">

        {/* ====================================================
            BACK BUTTON
        ==================================================== */}

        <button
          className="back-link"
          onClick={() => navigate("/results")}
        >
          ← Results
        </button>


        {/* ====================================================
            REPORT HEADER
        ==================================================== */}

        <div className="report-head">

          <div>

            <p className="eyebrow">
              NIYAMNETRA INSPECTION REPORT
            </p>

            <h1>
              {productName}
            </h1>

            <p>
              {result.inspectionId || "N/A"} ·{" "}
              {result.date || "N/A"}
            </p>

          </div>


          <div className="badge-row">

            <StatusBadge
              status={compliance.overall_status}
            />

            <RiskBadge
              risk={compliance.risk_level}
            />

          </div>

        </div>


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="panel">

          <h2>
            Summary
          </h2>

          <p>
            NiyamNetra detected{" "}
            <strong>
              {detectedCount}
            </strong>{" "}
            of{" "}
            <strong>
              {totalConfigured}
            </strong>{" "}
            configured declarations.
          </p>

          {compliance.note && (
            <div className="notice-box">
              {compliance.note}
            </div>
          )}

        </section>


        {/* ====================================================
            DETECTED DECLARATIONS
        ==================================================== */}

        <section className="panel">

          <h2>
            Detected Declarations
          </h2>

          {detectedCount === 0 ? (

            <p className="muted">
              No configured declarations were detected.
            </p>

          ) : (

            <div className="declaration-list">

              {fields.map(([key, label]) => {

                if (!isDetected(key)) {
                  return null;
                }

                return (
                  <div
                    className="declaration-row"
                    key={key}
                  >

                    <div>

                      <strong>
                        {label}
                      </strong>

                      <p>
                        {getDeclarationValue(key)}
                      </p>

                    </div>

                    <span className="detected-label">
                      DETECTED
                    </span>

                  </div>
                );
              })}

            </div>
          )}

        </section>


        {/* ====================================================
            MISSING DECLARATIONS
        ==================================================== */}

        <section className="panel">

          <h2>
            Missing Declarations
          </h2>

          {missingDeclarations.length === 0 ? (

            <p className="success-text">
              No missing configured declarations
              were detected.
            </p>

          ) : (

            <ul>

              {missingDeclarations.map(
                ([key, label]) => (

                  <li key={key}>

                    <strong>
                      {label}
                    </strong>

                    {" "}— Declaration missing

                  </li>

                )
              )}

            </ul>
          )}

        </section>


        {/* ====================================================
            COMPLIANCE RESULT
        ==================================================== */}

        <section className="panel">

          <h2>
            Compliance Assessment
          </h2>

          {compliance.overall_status ===
          "COMPLIANT" ? (

            <p className="success-text">
              The product label satisfies the
              configured compliance checks.
            </p>

          ) : compliance.overall_status ===
            "VIOLATION" ? (

            <p className="error-text">
              The product label contains one or
              more compliance violations.
            </p>

          ) : (

            <p className="muted">
              The system could not confidently
              determine the compliance status.
            </p>

          )}

          {compliance.violations &&
            compliance.violations.length > 0 && (

            <div className="violation-list">

              {compliance.violations.map(
                (violation, index) => (

                  <div
                    className="violation-item"
                    key={index}
                  >

                    <strong>
                      Violation {index + 1}
                    </strong>

                    <p>
                      {typeof violation === "string"
                        ? violation
                        : violation.message ||
                          violation.reason ||
                          violation.rule ||
                          "Compliance violation detected."}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </section>


        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <p className="disclaimer">

          Prototype result only. It supports
          inspection and review; it is not a
          legal determination.

        </p>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="result-actions">

          <button
            className="secondary-btn"
            onClick={() => navigate("/results")}
          >
            Back to Results
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/history")}
          >
            View History
          </button>

        </div>

      </main>
    </>
  );
}
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

export default function Results() {
  const navigate = useNavigate();

  const result = JSON.parse(
    localStorage.getItem("scanResult") || "null"
  );

  // ==========================================================
  // NO RESULT
  // ==========================================================

  if (!result) {
    return (
      <>
        <Navbar />

        <main className="page">
          <section className="panel">

            <h1>
              No scan result available
            </h1>

            <p className="muted">
              Please scan a product first to view
              the compliance result.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/new-inspection")
              }
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

  const declarations =
    result.declarations || {};

  const compliance =
    result.compliance_check || {};

  const ocrConfidence =
    result.ocr_confidence || {};

  // ==========================================================
  // GET DECLARATION VALUE
  // ==========================================================

  const getDeclarationValue = (key) => {

    // Product name is manually entered by consumer
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

    const value =
      getDeclarationValue(key);

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  };

  // ==========================================================
  // DETECTED DECLARATIONS
  // ==========================================================

  const detectedFields =
    fields.filter(
      ([key]) => isDetected(key)
    );

  // ==========================================================
  // MISSING DECLARATIONS
  // ==========================================================

  const missingFields =
    fields.filter(
      ([key]) => !isDetected(key)
    );

  // ==========================================================
  // COUNT
  // ==========================================================

  const detectedCount =
    detectedFields.length;

  const totalFields =
    fields.length;

  // ==========================================================
  // PRODUCT NAME
  // ==========================================================

  const productName =
    result.productName ||
    declarations.product_name ||
    "Unknown Product";

  // ==========================================================
  // INSPECTION DETAILS
  // ==========================================================

  const inspectionId =
    result.inspectionId ||
    "N/A";

  const inspectionDate =
    result.date ||
    "N/A";

  // ==========================================================
  // OCR CONFIDENCE
  // ==========================================================

  const averageConfidence =
    ocrConfidence.average_confidence ??
    ocrConfidence.average ??
    null;

  // ==========================================================
  // COMPLIANCE CHECKS
  // ==========================================================

  const checks =
    compliance.checks ||
    compliance.details ||
    [];

  // ==========================================================
  // VIOLATIONS
  // ==========================================================

  const violations =
    compliance.violations ||
    [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <Navbar />

      <main className="page">

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="result-hero panel">

          <div>

            <p className="eyebrow">
              INSPECTION RESULT
            </p>

            <h1>
              {productName}
            </h1>

            <p className="muted">
              Inspection ID: {inspectionId}
            </p>

            <p className="muted">
              Date: {inspectionDate}
            </p>

          </div>


          <div className="result-badges">

            <StatusBadge
              status={
                compliance.overall_status
              }
            />

            <RiskBadge
              risk={
                compliance.risk_level
              }
            />

          </div>

        </section>


        {/* ====================================================
            OCR CONFIDENCE
        ==================================================== */}

        {averageConfidence !== null && (

          <section className="panel">

            <p className="eyebrow">
              OCR ANALYSIS
            </p>

            <h2>
              Extraction Confidence
            </h2>

            <div className="confidence-value">
              {Number(
                averageConfidence
              ).toFixed(2)}
              %
            </div>

            <p className="muted">
              This indicates how confidently
              text was extracted from the
              uploaded product images.
            </p>

          </section>

        )}


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="panel">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                SUMMARY
              </p>

              <h2>
                Declaration Coverage
              </h2>

            </div>

            <div className="summary-count">
              {detectedCount} / {totalFields}
            </div>

          </div>


          <p>

            NiyamNetra detected{" "}

            <strong>
              {detectedCount}
            </strong>{" "}

            of{" "}

            <strong>
              {totalFields}
            </strong>{" "}

            configured mandatory
            declarations.

          </p>

        </section>


        {/* ====================================================
            MISSING DECLARATIONS
        ==================================================== */}

        {missingFields.length > 0 && (

          <section className="panel">

            <p className="eyebrow">
              ATTENTION REQUIRED
            </p>

            <h2>
              Missing Declarations
            </h2>

            <div className="declaration-list">

              {missingFields.map(
                ([key, label]) => (

                  <div
                    className="declaration-row missing"
                    key={key}
                  >

                    <div>

                      <strong>
                        {label}
                      </strong>

                      <p className="muted">
                        Not detected
                      </p>

                    </div>

                    <span className="missing-label">
                      MISSING
                    </span>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ====================================================
            DETECTED DECLARATIONS
        ==================================================== */}

        <section className="panel">

          <p className="eyebrow">
            DECLARATIONS
          </p>

          <h2>
            Detected Product Information
          </h2>

          <div className="declaration-list">

            {detectedFields.map(
              ([key, label]) => (

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

              )
            )}

          </div>

        </section>


        {/* ====================================================
            COMPLIANCE CHECKS
        ==================================================== */}

        {checks.length > 0 && (

          <section className="panel">

            <p className="eyebrow">
              RULE ENGINE
            </p>

            <h2>
              Compliance Checks
            </h2>

            <div className="compliance-check-list">

              {checks.map(
                (check, index) => {

                  const name =
                    check.name ||
                    check.rule ||
                    check.field ||
                    `Check ${index + 1}`;

                  const status =
                    check.status ||
                    check.result ||
                    "";

                  return (
                    <div
                      className="compliance-check-row"
                      key={index}
                    >

                      <div>

                        <strong>
                          {name}
                        </strong>

                        {check.message && (
                          <p className="muted">
                            {check.message}
                          </p>
                        )}

                      </div>

                      <span>
                        {status}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </section>

        )}


        {/* ====================================================
            VIOLATIONS
        ==================================================== */}

        {violations.length > 0 && (

          <section className="panel violation-panel">

            <p className="eyebrow">
              COMPLIANCE ISSUES
            </p>

            <h2>
              Detected Violations
            </h2>

            <div className="violation-list">

              {violations.map(
                (violation, index) => {

                  const text =
                    typeof violation === "string"
                      ? violation
                      : violation.message ||
                        violation.reason ||
                        violation.rule ||
                        "Compliance violation detected.";

                  return (
                    <div
                      className="violation-item"
                      key={index}
                    >

                      <strong>
                        Violation {index + 1}
                      </strong>

                      <p>
                        {text}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </section>

        )}


        {/* ====================================================
            COMPLIANCE NOTE
        ==================================================== */}

        <section className="panel">

          <p className="eyebrow">
            COMPLIANCE ASSESSMENT
          </p>

          {compliance.overall_status ===
          "COMPLIANT" ? (

            <p className="success-text">
              The product label satisfies
              the configured compliance checks.
            </p>

          ) : compliance.overall_status ===
            "VIOLATION" ? (

            <p className="error-text">
              The product label contains
              one or more compliance violations.
            </p>

          ) : (

            <p className="muted">
              The system could not confidently
              determine the compliance status.
            </p>

          )}

          {compliance.note && (
            <div className="notice-box">
              {compliance.note}
            </div>
          )}

        </section>


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <section className="result-actions">

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/history")
            }
          >
            View History
          </button>


          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/search-product")
            }
          >
            Search Product
          </button>


          <button
            className="primary-btn"
            onClick={() =>
              navigate("/report")
            }
          >
            View Full Report
          </button>

        </section>

      </main>
    </>
  );
}
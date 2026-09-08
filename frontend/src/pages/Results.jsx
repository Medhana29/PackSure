import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../results.css";

function Results() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("scanResult");

    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (error) {
        console.error("Unable to read scan result:", error);
      }
    }
  }, []);

  // No scan result available
  if (!result) {
    return (
      <div>
        <Navbar />

        <main className="page-container">
          <div className="no-results">
            <h2>No Scan Result Found</h2>

            <p>
              Please scan a product first.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/inspection")}
            >
              + New Inspection
            </button>
          </div>
        </main>
      </div>
    );
  }

  const declarations = result.declarations || {};
  const compliance = result.compliance_check || {};

  const violations = compliance.violations || [];
  const checks = compliance.checks || [];

  // Convert backend status into readable text
  const getStatusText = (status) => {
    if (!status) return "Not Available";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div>
      <Navbar />

      <main className="page-container">

        {/* PAGE HEADER */}
        <section className="results-header">
          <div>
            <h1>Inspection Results</h1>

            <p>
              Results extracted from the product package.
            </p>
          </div>
        </section>


        {/* OVERALL RESULT */}
        <section className="result-summary">

          <div className="summary-card">

            <h2>Overall Status</h2>

            <div
              className={
                compliance.overall_status ===
                "POTENTIALLY_COMPLIANT"
                  ? "status-compliant"
                  : "status-non-compliant"
              }
            >
              {getStatusText(
                compliance.overall_status
              )}
            </div>

          </div>


          <div className="summary-card">

            <h2>Risk Level</h2>

            <div className="risk-value">
              {compliance.risk_level || "UNKNOWN"}
            </div>

          </div>

        </section>


        {/* DECLARATIONS */}
        <section className="results-section">

          <h2>Detected Declarations</h2>

          <div className="declarations-grid">

            {/* PRODUCT NAME */}
            <div className="declaration-card">

              <h3>Product Name</h3>

              <p>
                {declarations.product_name ||
                  "Not detected"}
              </p>

            </div>


            {/* MANUFACTURER */}
            <div className="declaration-card">

              <h3>Manufacturer</h3>

              <p>
                {declarations.manufacturer ||
                  "Not detected"}
              </p>

            </div>


            {/* NET QUANTITY */}
            <div className="declaration-card">

              <h3>Net Quantity</h3>

              <p>
                {declarations.net_quantity ||
                  "Not detected"}
              </p>

            </div>


            {/* MRP */}
            <div className="declaration-card">

              <h3>MRP</h3>

              <p>
                {declarations.mrp ||
                  "Not detected"}
              </p>

            </div>


            {/* MANUFACTURING DATE */}
            <div className="declaration-card">

              <h3>Manufacturing Date</h3>

              <p>
                {declarations.manufacturing_date ||
                  "Not detected"}
              </p>

            </div>


            {/* CONSUMER CARE */}
            <div className="declaration-card">

              <h3>Consumer Care</h3>

              <p>
                {declarations.consumer_care ||
                  "Not detected"}
              </p>

            </div>

          </div>

        </section>


        {/* COMPLIANCE CHECKS */}
        {checks.length > 0 && (
          <section className="results-section">

            <h2>Compliance Checks</h2>

            <div className="checks-container">

              {checks.map((check, index) => (

                <div
                  className="check-item"
                  key={index}
                >

                  <div>

                    <strong>
                      {getStatusText(check.field)}
                    </strong>

                    <p>
                      {check.message}
                    </p>

                  </div>

                  <span
                    className={
                      check.status === "PASS"
                        ? "check-pass"
                        : "check-fail"
                    }
                  >
                    {check.status}
                  </span>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* VIOLATIONS */}
        <section className="results-section">

          <h2>Violations</h2>

          {violations.length === 0 ? (

            <div className="no-violations">

              <h3>
                ✓ No violations detected
              </h3>

              <p>
                All detected declarations passed
                the current compliance checks.
              </p>

            </div>

          ) : (

            <div className="violations-container">

              {violations.map(
                (violation, index) => (

                  <div
                    className="violation-item"
                    key={index}
                  >

                    <div>

                      <h3>
                        {getStatusText(
                          violation.field
                        )}
                      </h3>

                      <p>
                        {violation.message}
                      </p>

                    </div>

                    <span className="violation-severity">
                      {violation.severity}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* RAW OCR TEXT */}
        <section className="results-section">

          <details>

            <summary>
              View Extracted OCR Text
            </summary>

            <pre className="raw-text">
              {result.raw_text ||
                "No OCR text available."}
            </pre>

          </details>

        </section>


        {/* ACTION BUTTONS */}
        <section className="results-actions">

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/inspection")
            }
          >
            Scan Another Product
          </button>


          <button
            className="primary-btn"
            onClick={() =>
              navigate("/report")
            }
          >
            Show My Report
          </button>

        </section>

      </main>
    </div>
  );
}

export default Results;
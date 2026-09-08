import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StatusBadge from "../components/StatusBadge";
import RiskBadge from "../components/RiskBadge";
import DeclarationCard from "../components/DeclarationCard";
import RecommendationCard from "../components/RecommendationCard";

function Report() {
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

  // If no scan result exists
  if (!result) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Inspection Report</h1>
            <p>No inspection data available.</p>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/inspection")}
        >
          + New Inspection
        </button>
      </div>
    );
  }

  const declarations = result.declarations || {};
  const compliance = result.compliance_check || {};

  const violations = compliance.violations || [];

  // Convert declarations object into array
  const declarationList = [
  {
    name: "Product Name",
    value: declarations.product_name,
    status: declarations.product_name ? "compliant" : "missing",
  },
  {
    name: "Manufacturer",
    value: declarations.manufacturer,
    status: declarations.manufacturer ? "compliant" : "missing",
  },
  {
    name: "Net Quantity",
    value: declarations.net_quantity,
    status: declarations.net_quantity ? "compliant" : "missing",
  },
  {
    name: "MRP",
    value: declarations.mrp,
    status: declarations.mrp ? "compliant" : "missing",
  },
  {
    name: "Manufacturing Date",
    value: declarations.manufacturing_date,
    status: declarations.manufacturing_date
      ? "compliant"
      : "missing",
  },
  {
    name: "Consumer Care",
    value: declarations.consumer_care,
    status: declarations.consumer_care ? "compliant" : "missing",
  },
];
  // Convert backend status into text
  const getStatusText = (status) => {
    if (!status) return "UNKNOWN";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Create recommendation based on violations
  const recommendations =
    violations.length === 0
      ? [
          {
            title: "No immediate action required",
            description:
              "No compliance violations were detected in the available declarations.",
          },
        ]
      : violations.map((violation) => ({
          title: `Check ${violation.field.replaceAll("_", " ")}`,
          description:
            "Verify that this declaration is present and correctly displayed on the package.",
        }));

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Inspection Report</h1>

          <p>
            {declarations.product_name || "Unknown Product"} •{" "}
            {getStatusText(compliance.overall_status)}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/results")}
        >
          Back to Results
        </button>

      </div>

      {/* Report Summary */}
      <div className="report-summary">

        <div>
          <p className="label">Product</p>
          <h2>
            {declarations.product_name || "Not detected"}
          </h2>
        </div>

        <div>
          <p className="label">Status</p>

          <StatusBadge
            status={compliance.overall_status}
          />
        </div>

        <div>
          <p className="label">Risk</p>

          <RiskBadge
            risk={compliance.risk_level || "UNKNOWN"}
          />
        </div>

      </div>

      {/* Declaration Check */}
      <section>

        <div className="section-header">
          <h2>Declaration Check</h2>
        </div>

        <div className="declaration-grid">

          {declarationList.map((declaration, index) => (

            <DeclarationCard
              key={index}
              declaration={declaration}
            />

          ))}

        </div>

      </section>

      {/* Compliance Issues */}
      <section>

        <div className="section-header">
          <h2>Compliance Issues</h2>
        </div>

        {violations.length === 0 ? (

          <div className="violation-card">

            <h3>✓ No violations detected</h3>

            <p>
              All detected declarations passed the current
              compliance checks.
            </p>

          </div>

        ) : (

          violations.map((violation, index) => (

            <div
              className="violation-card"
              key={index}
            >

              <div className="violation-header">

                <h3>
                  {violation.field
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) =>
                      char.toUpperCase()
                    )}
                </h3>

                <span className="severity">
                  {violation.severity}
                </span>

              </div>

              <p>
                {violation.message}
              </p>

            </div>

          ))

        )}

      </section>

      {/* Recommendations */}
      <section>

        <div className="section-header">
          <h2>Recommendations</h2>
        </div>

        {recommendations.map(
          (recommendation, index) => (

            <RecommendationCard
              key={index}
              recommendation={recommendation}
            />

          )
        )}

      </section>

      {/* Report Button */}
      <div className="action-buttons">

        <button
          className="primary-button"
          onClick={() =>
            alert("Report download will be connected later.")
          }
        >
          Download Report
        </button>

      </div>

    </div>
  );
}

export default Report;
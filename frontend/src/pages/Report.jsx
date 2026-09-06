import { useNavigate } from "react-router-dom";

import inspectionData from "../mockData";

import StatusBadge from "../components/StatusBadge";
import RiskBadge from "../components/RiskBadge";
import DeclarationCard from "../components/DeclarationCard";
import RecommendationCard from "../components/RecommendationCard";

function Report() {
  const navigate = useNavigate();

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">

        <div>
          <h1>Inspection Report</h1>

          <p>
            {inspectionData.productName} •{" "}
            {inspectionData.inspectionId}
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
          <h2>{inspectionData.productName}</h2>
        </div>

        <div>
          <p className="label">Status</p>
          <StatusBadge status={inspectionData.status} />
        </div>

        <div>
          <p className="label">Risk</p>
          <RiskBadge risk={inspectionData.risk} />
        </div>

        <div>
          <p className="label">Confidence</p>
          <strong>{inspectionData.confidence}%</strong>
        </div>

      </div>

      {/* Declaration */}
      <section>

        <div className="section-header">
          <h2>Declaration Check</h2>
        </div>

        <div className="declaration-grid">

          {inspectionData.declarations.map((declaration, index) => (
            <DeclarationCard
              key={index}
              declaration={declaration}
            />
          ))}

        </div>

      </section>

      {/* Issues */}
      <section>

        <div className="section-header">
          <h2>Compliance Issues</h2>
        </div>

        {inspectionData.violations.map((violation, index) => (
          <div className="violation-card" key={index}>

            <div className="violation-header">
              <h3>{violation.title}</h3>

              <span className="severity">
                {violation.severity}
              </span>
            </div>

            <p>{violation.explanation}</p>

          </div>
        ))}

      </section>

      {/* Recommendations */}
      <section>

        <div className="section-header">
          <h2>Recommendations</h2>
        </div>

        {inspectionData.recommendations.map(
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
          onClick={() => alert("Report download will be connected later.")}
        >
          Download Report
        </button>

      </div>

    </div>
  );
}

export default Report;
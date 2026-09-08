import { useNavigate } from "react-router-dom";
import "../results.css";
import inspectionData from "../tempData";

import StatusBadge from "../components/StatusBadge";
import RiskBadge from "../components/RiskBadge";
import ConfidenceBar from "../components/ConfidenceBar";
import DeclarationCard from "../components/DeclarationCard";
import ViolationCard from "../components/ViolationCard";
import RecommendationCard from "../components/RecommendationCard";

function Results() {
  const navigate = useNavigate();

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Inspection Results</h1>
          <p>
            Compliance analysis for {inspectionData.productName}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/history")}
        >
          View History
        </button>
      </div>

      {/* Product Summary */}
      <div className="result-summary">

        <div>
          <p className="label">Product</p>
          <h2>{inspectionData.productName}</h2>

          <p className="inspection-id">
            Inspection ID: {inspectionData.inspectionId}
          </p>
        </div>

        <div className="result-status">
          <StatusBadge status={inspectionData.status} />
          <RiskBadge risk={inspectionData.risk} />
        </div>

      </div>

      {/* Confidence */}
      <div className="card">
        <ConfidenceBar
          confidence={inspectionData.confidence}
        />
      </div>

      {/* Declaration Details */}
      <section>

        <div className="section-header">
          <h2>Declaration Details</h2>
          <p>Detected mandatory product information</p>
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

      {/* Violations */}
      <section>

        <div className="section-header">
          <h2>Compliance Issues</h2>
          <p>Potential problems detected during inspection</p>
        </div>

        <div className="violations">

          {inspectionData.violations.map((violation, index) => (
            <ViolationCard
              key={index}
              violation={violation}
            />
          ))}

        </div>

      </section>

      {/* Recommendations */}
      <section>

        <div className="section-header">
          <h2>Recommendations</h2>
          <p>Suggested actions to improve compliance</p>
        </div>

        <div>

          {inspectionData.recommendations.map(
            (recommendation, index) => (
              <RecommendationCard
                key={index}
                recommendation={recommendation}
              />
            )
          )}

        </div>

      </section>

      {/* Buttons */}
      <div className="action-buttons">

        <button
          className="secondary-button"
          onClick={() => alert("Review request submitted!")}
        >
          Request Review
        </button>

        <button
          className="primary-button"
          onClick={() => navigate("/report")}
        >
          View Report
        </button>

      </div>

    </div>
  );
}

export default Results;
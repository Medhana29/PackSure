import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../reviewInspection.css";
const ReviewInspection = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Pending");

  const handleReview = (reviewStatus) => {
    setStatus(reviewStatus);
  };

  return (
  <div className="review-page">

    <div className="review-header">
      <h1>Review Product</h1>
      <p>Government authority inspection</p>
    </div>

    <div className="review-card">

      <div className="review-details">

        <div className="detail-item">
          <span>Inspection ID</span>
          <strong>{inspectionId}</strong>
        </div>

        <div className="detail-item">
          <span>Product</span>
          <strong>ABC Biscuits</strong>
        </div>

        <div className="detail-item">
          <span>Risk</span>
          <strong className="risk-high">HIGH</strong>
        </div>

        <div className="detail-item">
          <span>Status</span>
          <strong>{status}</strong>
        </div>

      </div>

      <div className="compliance-box">
        <h3>Compliance Result</h3>

        <p>
          POTENTIALLY NON-COMPLIANT
        </p>
      </div>

      {status === "Pending" ? (
        <div className="review-actions">

          <button
            className="accept-btn"
            onClick={() => handleReview("ACCEPTED")}
          >
            ACCEPT
          </button>

          <button
            className="reject-btn"
            onClick={() => handleReview("REJECTED")}
          >
            REJECT
          </button>

        </div>
      ) : (
        <div className="completed-review">

          <p>
            Review completed with status:
            <strong> {status}</strong>
          </p>

          <button
            className="back-btn"
            onClick={() => navigate("/government")}
          >
            Back to Dashboard
          </button>

        </div>
      )}

    </div>
  </div>
);
};

export default ReviewInspection;
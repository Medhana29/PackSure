import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ReviewInspection = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Pending");

  const handleReview = (reviewStatus) => {
    setStatus(reviewStatus);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Review Product</h2>

      <div className="card shadow-sm">
        <div className="card-body">

          <p>
            <strong>Inspection ID:</strong> {inspectionId}
          </p>

          <p>
            <strong>Product:</strong> ABC Biscuits
          </p>

          <p>
            <strong>Risk:</strong> HIGH
          </p>

          <p>
            <strong>Status:</strong> {status}
          </p>

          <hr />

          <h5>Compliance Result</h5>

          <p className="mb-4">
            POTENTIALLY NON-COMPLIANT
          </p>

          {status === "Pending" ? (
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => handleReview("ACCEPTED")}
              >
                ACCEPT
              </button>

              <button
                className="btn btn-danger"
                onClick={() => handleReview("REJECTED")}
              >
                REJECT
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/government")}
            >
              Back to Dashboard
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReviewInspection;
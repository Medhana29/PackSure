import React from "react";
import { useNavigate } from "react-router-dom";
import "../../government.css";
const GovernmentDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Pending Reviews", value: 18 },
    { title: "High Risk", value: 5 },
    { title: "Reviewed Today", value: 32 },
    { title: "Violations", value: 14 },
  ];

  const pendingReviews = [
    {
      id: "PS101",
      product: "ABC Biscuits",
      risk: "HIGH",
      status: "Pending",
    },
    {
      id: "PS102",
      product: "XYZ Soap",
      risk: "MEDIUM",
      status: "Pending",
    },
    {
      id: "PS103",
      product: "Juice",
      risk: "LOW",
      status: "Pending",
    },
  ];

  return (
    <div className="government-page">
      <h1 className="government-title">
  Government Authority Dashboard
</h1>

<p className="government-subtitle">
  Review product compliance inspections and violations
</p>
      {/* Statistics */}
      <div className="government-stats">
        {stats.map((stat, index) => (
          <div className="government-stat" key={index}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="text-muted">{stat.title}</h6>
                <h2>{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Reviews */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Pending Reviews</h4>

          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {pendingReviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.product}</td>
                    <td>{review.risk}</td>
                    <td>{review.status}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(`/government/review/${review.id}`)
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
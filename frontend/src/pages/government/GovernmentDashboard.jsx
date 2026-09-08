import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import "../../government.css";

const GovernmentDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Pending Reviews",
      value: 18,
      type: "review",
    },
    {
      title: "High Risk",
      value: 5,
      type: "danger",
    },
    {
      title: "Reviewed Today",
      value: 32,
      type: "success",
    },
    {
      title: "Violations",
      value: 14,
      type: "danger",
    },
  ];

  const pendingReviews = [
    {
      id: "PS101",
      productName: "Kurkure",
      risk: "HIGH",
      status: "Pending",
    },
    {
      id: "PS102",
      productName: "DiSano Peanut Butter",
      risk: "MEDIUM",
      status: "Pending",
    },
    {
      id: "PS103",
      productName: "ABC Biscuits",
      risk: "LOW",
      status: "Pending",
    },
  ];

  return (
    <div className="government-page">

      {/* HEADER / NAVBAR */}
      <header className="dashboard-navbar">

        <div className="dashboard-navbar-logo">
          <Logo size="navbar-logo-size" />
        </div>

        <div className="dashboard-navbar-title">
          <span>Government Authority Portal</span>
        </div>

      </header>

      {/* DASHBOARD CONTENT */}
      <main className="dashboard-content">

        {/* PAGE HEADER */}
        <section className="dashboard-header">

          <div>
            <h1>Government Authority Dashboard</h1>

            <p>
              Review product compliance inspections and violations.
            </p>
          </div>

        </section>

        {/* STATISTICS */}
        <div className="government-stats">

          {stats.map((stat, index) => (

            <div
              className={`government-stat ${stat.type}`}
              key={index}
            >

              <div className="card">

                <div className="card-body">

                  <h6>{stat.title}</h6>

                  <h2>{stat.value}</h2>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* PENDING REVIEWS */}
        <div className="government-review-card">

          <div className="card-body">

            <h4>Pending Reviews</h4>

            <div className="table-responsive">

              <table className="government-table">

                <thead>

                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {pendingReviews.map((review) => (

                    <tr key={review.id}>

                      {/* PRODUCT ID */}
                      <td>
                        <strong>{review.id}</strong>
                      </td>

                      {/* PRODUCT NAME */}
                      <td>
                        <strong>{review.productName}</strong>
                      </td>

                      {/* RISK */}
                      <td>

                        <span
                          className={`risk-badge risk-${review.risk.toLowerCase()}`}
                        >
                          {review.risk}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span className="status-badge">
                          {review.status}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td>

                        <button
                          className="review-btn"
                          onClick={() =>
                            navigate(
                              `/government/review/${review.id}`
                            )
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

      </main>

    </div>
  );
};

export default GovernmentDashboard;
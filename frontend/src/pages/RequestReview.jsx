import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

function RequestReview() {

  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  function submitReview(e) {

    e.preventDefault();

    if (!reason || !message) {

      alert("Please fill all fields.");

      return;
    }

    alert(
      "Review request submitted successfully!"
    );

    navigate("/dashboard");
  }

  return (
    <div>

      <Navbar />

      <main className="page-container">

        <div className="review-card">

          <h1>Request a Review</h1>

          <p>
            Think the compliance result is incorrect?
            Submit your concern for further review.
          </p>

          <form onSubmit={submitReview}>

            <label>
              Reason for Review
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >

              <option value="">
                Select a reason
              </option>

              <option value="incorrect-result">
                I think the result is incorrect
              </option>

              <option value="missing-information">
                Some information is missing
              </option>

              <option value="image-problem">
                Image was incorrectly interpreted
              </option>

              <option value="other">
                Other
              </option>

            </select>

            <label>
              Additional Details
            </label>

            <textarea
              rows="6"
              placeholder="Explain your concern..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="inspection-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/results")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
              >
                Submit Review
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default RequestReview;
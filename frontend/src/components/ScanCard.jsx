import { useNavigate } from "react-router-dom";

function ScanCard() {
  const navigate = useNavigate();

  return (
    <div className="scan-card">

      <div className="scan-icon">
        📷
      </div>

      <div>
        <h3>New Product Inspection</h3>

        <p>
          Upload product package images and check
          whether the product follows Legal Metrology rules.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/inspection")}
        >
          Start New Scan
        </button>
      </div>

    </div>
  );
}

export default ScanCard;
import { useNavigate } from "react-router-dom";

import HistoryCard from "../components/HistoryCard";

const historyData = [
  {
    productName: "ABC Biscuits",
    inspectionId: "INS-001",
    date: "06 September 2026",
    status: "Potentially Non-Compliant",
    risk: "Medium",
    confidence: 92
  },
  {
    productName: "XYZ Shampoo",
    inspectionId: "INS-002",
    date: "05 September 2026",
    status: "Compliant",
    risk: "Low",
    confidence: 96
  },
  {
    productName: "Fresh Juice",
    inspectionId: "INS-003",
    date: "03 September 2026",
    status: "Non-Compliant",
    risk: "High",
    confidence: 88
  }
];

function History() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>Inspection History</h1>

          <p>
            View your previous product inspections.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => navigate("/results")}
        >
          Latest Results
        </button>

      </div>

      <div className="history-list">

        {historyData.map((inspection) => (
          <HistoryCard
            key={inspection.inspectionId}
            inspection={inspection}
            onView={() => navigate("/results")}
          />
        ))}

      </div>

    </div>
  );
}

export default History;
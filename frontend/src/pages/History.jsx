import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HistoryCard from "../components/HistoryCard";

function History() {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const savedHistory =
      JSON.parse(localStorage.getItem("scanHistory")) || [];

    // Show newest inspection first
    setHistoryData(savedHistory.reverse());
  }, []);

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

        {historyData.length === 0 ? (

          <div className="no-results">
            <h2>No Inspection History</h2>

            <p>
              Scan a product to see your inspection history here.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/inspection")}
            >
              + New Inspection
            </button>
          </div>

        ) : (

          historyData.map((inspection) => (

            <HistoryCard
              key={inspection.inspectionId}
              inspection={inspection}
              onView={() => {
                // Make this inspection the current result
                localStorage.setItem(
                  "scanResult",
                  JSON.stringify(inspection)
                );

                navigate("/results");
              }}
            />

          ))

        )}

      </div>

    </div>
  );
}

export default History;
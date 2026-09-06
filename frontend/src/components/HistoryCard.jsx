import StatusBadge from "./StatusBadge";
import RiskBadge from "./RiskBadge";

function HistoryCard({ inspection, onView }) {
  return (
    <div className="history-card">

      <div className="history-main">
        <h3>{inspection.productName}</h3>

        <p>
          Inspection ID: {inspection.inspectionId}
        </p>

        <small>{inspection.date}</small>
      </div>

      <div className="history-status">
        <StatusBadge status={inspection.status} />
        <RiskBadge risk={inspection.risk} />
      </div>

      <div className="history-confidence">
        <strong>{inspection.confidence}%</strong>
        <span>Confidence</span>
      </div>

      <button onClick={onView}>
        View
      </button>

    </div>
  );
}

export default HistoryCard;
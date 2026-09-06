function ConfidenceBar({ confidence }) {
  return (
    <div className="confidence-container">
      <div className="confidence-header">
        <span>Confidence</span>
        <strong>{confidence}%</strong>
      </div>

      <div className="confidence-bar">
        <div
          className="confidence-fill"
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ConfidenceBar;
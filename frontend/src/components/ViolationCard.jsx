function ViolationCard({ violation }) {
  return (
    <div className="violation-card">
      <div className="violation-header">
        <h3>{violation.title}</h3>

        <span className="severity">
          {violation.severity}
        </span>
      </div>

      <p>{violation.explanation}</p>
    </div>
  );
}

export default ViolationCard;
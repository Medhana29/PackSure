function RiskBadge({ risk }) {
  return (
    <span className={`risk-badge ${risk.toLowerCase()}`}>
      {risk} Risk
    </span>
  );
}

export default RiskBadge;
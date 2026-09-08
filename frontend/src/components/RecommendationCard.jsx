function RecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <span>✓</span>
      <p>{recommendation}</p>
    </div>
  );
}

export default RecommendationCard;
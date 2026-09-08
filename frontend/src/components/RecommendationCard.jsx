function RecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      <h3>{recommendation.title}</h3>

      <p>{recommendation.description}</p>
    </div>
  );
}

export default RecommendationCard;
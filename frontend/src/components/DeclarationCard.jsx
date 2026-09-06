function DeclarationCard({ declaration }) {
  const isCompliant = declaration.status === "compliant";

  return (
    <div className="declaration-card">
      <div className={`declaration-icon ${isCompliant ? "success" : "danger"}`}>
        {isCompliant ? "✓" : "✗"}
      </div>

      <div>
        <strong>{declaration.name}</strong>

        <p>
          {isCompliant
            ? "Declaration detected"
            : "Declaration missing"}
        </p>
      </div>
    </div>
  );
}

export default DeclarationCard;
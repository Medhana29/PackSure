import React from "react";
export default function RiskBadge({ risk }) {
  const cls =
    risk === "HIGH" ? "risk high" :
    risk === "MEDIUM" ? "risk medium" :
    risk === "LOW" ? "risk low" : "risk unknown";

  return <span className={cls}>{risk || "UNKNOWN"} RISK</span>;
}

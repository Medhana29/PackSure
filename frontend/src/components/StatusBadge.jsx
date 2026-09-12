import React from "react";
export default function StatusBadge({ status }) {
  const text = (status || "UNKNOWN").replaceAll("_", " ");
  const cls =
    status === "POTENTIALLY_COMPLIANT" ? "status compliant" :
    status === "POTENTIALLY_NON_COMPLIANT" ? "status noncompliant" :
    "status review";

  return <span className={cls}>{text}</span>;
}

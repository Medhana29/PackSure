from compliance.schemas import DeclarationInput
from compliance.rules import (
    REQUIRED_FIELDS,
    FIELD_SEVERITY,
    SEVERITY_POINTS,
    RISK_THRESHOLDS,
    MIN_DETECTED_FIELDS_FOR_VERDICT,
)

def check_compliance(declarations: dict) -> dict:
    validated = DeclarationInput(**declarations)
    declarations = validated.model_dump()

    checks = _build_checks(declarations)
    detected_count = sum(1 for c in checks if c["status"] == "PASS")

    if detected_count <= MIN_DETECTED_FIELDS_FOR_VERDICT:
        return {
            "overall_status": "UNABLE_TO_DETERMINE",
            "risk_level": "UNKNOWN",
            "checks": checks,
            "violations": [],
            "note": (
                "Very few declarations were detected. This may be due to "
                "poor image quality rather than actual non-compliance. "
                "Please try uploading a clearer image."
            ),
        }

    violations = _build_violations(checks)
    return {
        "overall_status": (
            "POTENTIALLY_COMPLIANT"
            if not violations else "POTENTIALLY_NON_COMPLIANT"
        ),
        "risk_level": _calculate_risk(violations),
        "checks": checks,
        "violations": violations,
    }

def _build_checks(declarations):
    checks = []
    for field in REQUIRED_FIELDS:
        value = declarations.get(field)
        checks.append({
            "field": field,
            "status": "PASS" if value else "FAIL",
            "message": (
                f"{_readable(field)} detected"
                if value else f"{_readable(field)} not detected"
            ),
        })
    return checks

def _build_violations(checks):
    return [
        {
            "field": c["field"],
            "severity": FIELD_SEVERITY.get(c["field"], "LOW"),
            "message": c["message"],
        }
        for c in checks
        if c["status"] == "FAIL"
    ]

def _readable(field):
    return field.replace("_", " ").title()

def _calculate_risk(violations):
    score = sum(
        SEVERITY_POINTS.get(v["severity"], 1)
        for v in violations
    )
    for level, (low, high) in RISK_THRESHOLDS.items():
        if low <= score <= high:
            return level
    return "LOW"

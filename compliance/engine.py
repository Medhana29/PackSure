# engine.py
# Core compliance checking logic for PackSure.
# Input: declarations JSON from OCR/Extraction module (Person 2)
# Output: compliance JSON as defined in API_Contract.txt

from compliance.schemas import DeclarationInput, ComplianceResult
from compliance.rules import (
    REQUIRED_FIELDS,
    FIELD_SEVERITY,
    SEVERITY_POINTS,
    RISK_THRESHOLDS,
    MIN_DETECTED_FIELDS_FOR_VERDICT
)


def check_compliance(declarations: dict) -> dict:
    """
    Takes the extracted declarations dictionary and returns
    a structured compliance result following the API contract.
    """
    validated_input = DeclarationInput(**declarations)
    declarations = validated_input.dict()

    # Build the checks list first (always, regardless of outcome)
    # so the user can always see what was/wasn't detected.
    checks = _build_checks(declarations)
    detected_count = sum(1 for c in checks if c["status"] == "PASS")

    # -----------------------------------------------------------
    # Image quality guard: if very few fields were detected at all,
    # this is likely a bad photo, not genuine non-compliance.
    # -----------------------------------------------------------
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
            )
        }

    # -----------------------------------------------------------
    # Normal path: enough fields were detected to trust the result.
    # -----------------------------------------------------------
    violations = _build_violations(checks)
    overall_status = _determine_status(violations)
    risk_level = _calculate_risk(violations)

    return {
        "overall_status": overall_status,
        "risk_level": risk_level,
        "checks": checks,
        "violations": violations
    }


def _build_checks(declarations: dict) -> list:
    """
    Builds the PASS/FAIL check list for every required field.
    """
    checks = []
    for field in REQUIRED_FIELDS:
        value = declarations.get(field)
        if value:
            checks.append({
                "field": field,
                "status": "PASS",
                "message": f"{_readable(field)} detected"
            })
        else:
            checks.append({
                "field": field,
                "status": "FAIL",
                "message": f"{_readable(field)} not detected"
            })
    return checks


def _build_violations(checks: list) -> list:
    """
    Builds the violations list from failed checks.
    """
    violations = []
    for check in checks:
        if check["status"] == "FAIL":
            field = check["field"]
            violations.append({
                "field": field,
                "severity": FIELD_SEVERITY.get(field, "LOW"),
                "message": check["message"]
            })
    return violations


def _readable(field: str) -> str:
    """Converts field_name to 'Field Name' for messages."""
    return field.replace("_", " ").title()


def _determine_status(violations: list) -> str:
    """
    Decides overall compliance status based on violations found.
    Only two possible outcomes here — UNABLE_TO_DETERMINE is handled
    separately, before this function is ever called.
    """
    if not violations:
        return "POTENTIALLY_COMPLIANT"
    return "POTENTIALLY_NON_COMPLIANT"


def _calculate_risk(violations: list) -> str:
    """
    Calculates a simple risk score based on violation severities,
    then maps it to LOW / MEDIUM / HIGH.
    """
    score = sum(SEVERITY_POINTS.get(v["severity"], 1) for v in violations)

    for level, (low, high) in RISK_THRESHOLDS.items():
        if low <= score <= high:
            return level

    return "LOW"  # fallback, should not normally happen
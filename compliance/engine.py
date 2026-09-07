# engine.py
# Core compliance checking logic for PackSure.
# Input: declarations JSON from OCR/Extraction module (Person 2)
# Output: compliance JSON as defined in API_Contract.txt
from compliance.schemas import DeclarationInput, ComplianceResult
from compliance.rules import REQUIRED_FIELDS, FIELD_SEVERITY, SEVERITY_POINTS, RISK_THRESHOLDS


def check_compliance(declarations: dict) -> dict:
    """
    Takes the extracted declarations dictionary and returns
    a structured compliance result following the API contract.
    """
    validated_input = DeclarationInput(**declarations)
    declarations = validated_input.dict()

    checks = []
    violations = []

    for field in REQUIRED_FIELDS:
        value = declarations.get(field)

        if value:  # value is present and not None/empty
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
            violations.append({
                "field": field,
                "severity": FIELD_SEVERITY.get(field, "LOW"),
                "message": f"{_readable(field)} not detected"
            })

    overall_status = _determine_status(violations)
    risk_level = _calculate_risk(violations)

    return {
        "overall_status": overall_status,
        "risk_level": risk_level,
        "checks": checks,
        "violations": violations
    }


def _readable(field: str) -> str:
    """Converts field_name to 'Field Name' for messages."""
    return field.replace("_", " ").title()


def _determine_status(violations: list) -> str:
    """
    Decides overall compliance status based on violations found.
    """
    if not violations:
        return "POTENTIALLY_COMPLIANT"

    high_severity_count = sum(1 for v in violations if v["severity"] == "HIGH")

    if high_severity_count >= 2:
        return "REVIEW_REQUIRED"

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
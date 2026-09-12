def generate_report(scan_result: dict) -> dict:
    compliance = scan_result.get("compliance_check", {})
    return {
        "title": "NiyamNetra Inspection Report",
        "inspection_status": compliance.get("overall_status", "UNKNOWN"),
        "risk_level": compliance.get("risk_level", "UNKNOWN"),
        "declarations": scan_result.get("declarations", {}),
        "violations": compliance.get("violations", []),
    }

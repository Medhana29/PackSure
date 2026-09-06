# rules.py
# Defines the required declaration fields and their severity levels
# for the PackSure compliance engine.

REQUIRED_FIELDS = [
    "product_name",
    "manufacturer",
    "net_quantity",
    "mrp",
    "manufacturing_date",
    "consumer_care"
]

# Severity assigned to each field if it's missing.
# These are design choices for risk prioritization, not legal values.
FIELD_SEVERITY = {
    "mrp": "HIGH",
    "net_quantity": "HIGH",
    "manufacturer": "MEDIUM",
    "product_name": "MEDIUM",
    "consumer_care": "MEDIUM",
    "manufacturing_date": "LOW"
}

# Points assigned per severity level, used for risk score calculation
SEVERITY_POINTS = {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 3
}

# Risk level thresholds based on total accumulated points
RISK_THRESHOLDS = {
    "LOW": (0, 2),      # 0 to 2 points inclusive
    "MEDIUM": (3, 5),   # 3 to 5 points inclusive
    "HIGH": (6, float("inf"))  # 6+ points
}
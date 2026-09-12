REQUIRED_FIELDS = [
    "product_name",
    "manufacturer",
    "net_quantity",
    "mrp",
    "manufacturing_date",
    "consumer_care",
]

FIELD_SEVERITY = {
    "mrp": "HIGH",
    "net_quantity": "HIGH",
    "manufacturer": "MEDIUM",
    "product_name": "MEDIUM",
    "consumer_care": "MEDIUM",
    "manufacturing_date": "LOW",
}

SEVERITY_POINTS = {
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
}

RISK_THRESHOLDS = {
    "LOW": (0, 2),
    "MEDIUM": (3, 5),
    "HIGH": (6, 100),
}

MIN_DETECTED_FIELDS_FOR_VERDICT = 1

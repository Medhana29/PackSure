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

# rules.py (add this at the bottom)

FIELD_EXPLANATIONS = {
    "product_name": {
        "why_it_matters": "The product name helps consumers correctly identify what they are purchasing.",
        "recommended_action": "Verify the product name is printed clearly on another visible panel."
    },
    "manufacturer": {
        "why_it_matters": "Manufacturer details establish accountability and traceability for the product.",
        "recommended_action": "Check other package surfaces for manufacturer name and address."
    },
    "net_quantity": {
        "why_it_matters": "Net quantity ensures consumers know exactly how much product they are buying.",
        "recommended_action": "Confirm the quantity declaration is present and clearly legible."
    },
    "mrp": {
        "why_it_matters": "MRP protects consumers from being overcharged beyond the declared price.",
        "recommended_action": "Verify the MRP is printed with correct currency symbol and formatting."
    },
    "manufacturing_date": {
        "why_it_matters": "Manufacturing/packing date helps consumers assess product freshness and shelf life.",
        "recommended_action": "Check for a manufacturing or packing date on other package panels."
    },
    "consumer_care": {
        "why_it_matters": "Consumer care details provide a channel for complaints, queries, and support.",
        "recommended_action": "Check other sides of the package. If genuinely absent, flag for review."
    }
}
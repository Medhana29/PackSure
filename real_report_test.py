# real_report_test.py
# Generates a PDF report using real OCR-extracted data
# to produce a demo-ready artifact.

from compliance.engine import check_compliance
from compliance.report_generator import generate_report

# Real data extracted earlier via OCR on the Kurkure product
real_declarations = {
    "product_name": "Kurkure",
    "manufacturer": "PepsiCo India Holdings Pvt. Ltd.",
    "net_quantity": "41.5 g",
    "mrp": "₹10",
    "manufacturing_date": "23/07/26",
    "consumer_care": "Phone: 1800 22 4020; Email: NSUMER.FEEDBACK@PEPSICO.COM"
}

result = check_compliance(real_declarations)
print("Compliance Result:", result)
print()

output_path = generate_report(
    compliance_result=result,
    product_name="Kurkure",
    scan_id="DEMO-001",
    output_path="real_demo_report.pdf",
    image_path="uploads/front_kurkure2.jpeg"
)

print(f"Report generated at: {output_path}")

# ============================================================
# Second report: simulate a missing declaration (violation case)
# ============================================================

print()
print("=== Generating violation-case report ===")

partial_declarations = {
    "product_name": "Kurkure",
    "manufacturer": "PepsiCo India Holdings Pvt. Ltd.",
    "net_quantity": "41.5 g",
    "mrp": "₹10",
    "manufacturing_date": "23/07/26",
    "consumer_care": None  # simulate a missing declaration
}

result2 = check_compliance(partial_declarations)
print("Compliance Result (violation case):", result2)
print()

output_path2 = generate_report(
    compliance_result=result2,
    product_name="Kurkure",
    scan_id="DEMO-002",
    output_path="real_demo_report_violation.pdf",
    image_path="uploads/front_kurkure2.jpeg"
)

print(f"Second report generated at: {output_path2}")

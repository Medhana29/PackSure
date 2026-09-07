# test_report.py
# Quick test for report_generator.py using sample compliance data

from compliance.engine import check_compliance
from compliance.report_generator import generate_report

sample_input = {
    "product_name": "ABC BISCUITS",
    "manufacturer": "ABC Foods Pvt Ltd",
    "net_quantity": "200 g",
    "mrp": "₹50",
    "manufacturing_date": "08/2026",
    "consumer_care": None,
    "raw_text": "ABC BISCUITS\nManufactured by ABC Foods Pvt Ltd..."
}

result = check_compliance(sample_input)

output_path = generate_report(
    compliance_result=result,
    product_name="ABC Biscuits",
    scan_id="INS-001",
    output_path="sample_report.pdf",
    image_path=None  # set to a real image path later if you have one to test with
)

print(f"Report generated at: {output_path}")
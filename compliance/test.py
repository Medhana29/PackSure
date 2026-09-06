# test.py
# Quick manual test for the compliance engine using sample data
# from API_Contract.txt — no need to wait for Person 2's OCR module.

from engine import check_compliance

# Sample 1: One field missing (consumer_care)
sample_input_1 = {
    "product_name": "ABC BISCUITS",
    "manufacturer": "ABC Foods Pvt Ltd",
    "net_quantity": "200 g",
    "mrp": "₹50",
    "manufacturing_date": "08/2026",
    "consumer_care": None,
    "raw_text": "ABC BISCUITS\nManufactured by ABC Foods Pvt Ltd..."
}

# Sample 2: All fields present
sample_input_2 = {
    "product_name": "XYZ SOAP",
    "manufacturer": "XYZ Pvt Ltd",
    "net_quantity": "100 g",
    "mrp": "₹40",
    "manufacturing_date": "07/2026",
    "consumer_care": "1800-123-456",
    "raw_text": "XYZ SOAP..."
}

# Sample 3: Multiple fields missing (should trigger REVIEW_REQUIRED)
sample_input_3 = {
    "product_name": "PQR JUICE",
    "manufacturer": None,
    "net_quantity": None,
    "mrp": "₹90",
    "manufacturing_date": None,
    "consumer_care": None,
    "raw_text": "PQR JUICE..."
}

if __name__ == "__main__":
    print("=== Sample 1 (one field missing) ===")
    print(check_compliance(sample_input_1))
    print()

    print("=== Sample 2 (all fields present) ===")
    print(check_compliance(sample_input_2))
    print()

    print("=== Sample 3 (multiple fields missing) ===")
    print(check_compliance(sample_input_3))
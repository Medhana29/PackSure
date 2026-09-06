# test_schemas.py
from engine import check_compliance

# This should work fine — valid input
good_input = {
    "product_name": "ABC BISCUITS",
    "manufacturer": "ABC Foods Pvt Ltd",
    "net_quantity": "200 g",
    "mrp": "₹50",
    "manufacturing_date": "08/2026",
    "consumer_care": None,
    "raw_text": "..."
}
print(check_compliance(good_input))
print("✅ Valid input passed correctly\n")

# This should raise a validation error — wrong field name
bad_input = {
    "product_name": "XYZ SOAP",
    "quantity": "100 g",  # WRONG - should be "net_quantity"
    "mrp": "₹40"
}

try:
    check_compliance(bad_input)
except Exception as e:
    print(f"✅ Correctly caught bad input: {e}")
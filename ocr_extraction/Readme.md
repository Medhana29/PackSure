Input: 
    curl -X POST "http://localhost:8000/api/scan" ^
    -F "front_image=@C:\path\to\kurkure_front.jpg" ^
    -F "back_image=@C:\path\to\kurkure_back.jpg"

Output:
    {
        "status": "success",
        "declarations": {
            "product_name": "Kurkure",
            "manufacturer": "PepsiCo India Holdings Pvt. Ltd.",
            "net_quantity": "41.5 g",
            "mrp": "₹10",
            "manufacturing_date": "23/07/26",
            "consumer_care": "Phone: 1800 22 4020; Email: NSUMER.FEEDBACK@PEPSICO.COM"
        },
        "compliance_check": {
            "overall_status": "POTENTIALLY_COMPLIANT",
            "risk_level": "LOW",
            "checks": [
                {
                    "field": "product_name",
                    "status": "PASS",
                    "message": "Product Name detected"
                },
                {
                    "field": "manufacturer",
                    "status": "PASS",
                    "message": "Manufacturer detected"
                },
                {
                    "field": "net_quantity",
                    "status": "PASS",
                    "message": "Net Quantity detected"
                },
                {
                    "field": "mrp",
                    "status": "PASS",
                    "message": "Mrp detected"
                },
                {
                    "field": "manufacturing_date",
                    "status": "PASS",
                    "message": "Manufacturing Date detected"
                },
                {
                    "field": "consumer_care",
                    "status": "PASS",
                    "message": "Consumer Care detected"
                }
            ],
            "violations": []
        }
    }
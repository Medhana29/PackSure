const inspectionData = {
  productName: "ABC Biscuits",
  inspectionId: "INS-001",
  date: "06 September 2026",

  status: "Potentially Non-Compliant",
  risk: "Medium",
  confidence: 92,

  declarations: [
    {
      name: "Product Name",
      status: "compliant"
    },
    {
      name: "MRP",
      status: "compliant"
    },
    {
      name: "Net Quantity",
      status: "compliant"
    },
    {
      name: "Manufacturer",
      status: "compliant"
    },
    {
      name: "Consumer Care",
      status: "missing"
    },
    {
      name: "Address",
      status: "missing"
    }
  ],

  violations: [
    {
      title: "Consumer Care Information Missing",
      severity: "Medium",
      explanation:
        "Consumer care information was not detected on the uploaded package."
    },
    {
      title: "Manufacturer Address Missing",
      severity: "Medium",
      explanation:
        "Complete manufacturer address was not detected on the package."
    }
  ],

  recommendations: [
    "Add consumer care information to the package.",
    "Add the complete manufacturer address.",
    "Verify all mandatory declarations before final packaging."
  ]
};

export default inspectionData;
from typing import Optional
from pydantic import BaseModel

class DeclarationInput(BaseModel):
    product_name: Optional[str] = None
    manufacturer: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    manufacturing_date: Optional[str] = None
    consumer_care: Optional[str] = None

class ComplianceResult(BaseModel):
    overall_status: str
    risk_level: str
    checks: list
    violations: list

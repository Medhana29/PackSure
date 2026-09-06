# schemas.py
# Pydantic models for validating data shapes exchanged with the
# compliance engine, as defined in API_Contract.txt

from pydantic import BaseModel
from typing import Optional, List


class DeclarationInput(BaseModel):
    """
    Expected shape of the input coming from Person 2's OCR/Extraction module.
    """
    product_name: Optional[str] = None
    manufacturer: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    manufacturing_date: Optional[str] = None
    consumer_care: Optional[str] = None
    raw_text: Optional[str] = None


class CheckItem(BaseModel):
    field: str
    status: str  # PASS / FAIL / WARNING
    message: str


class ViolationItem(BaseModel):
    field: str
    severity: str  # LOW / MEDIUM / HIGH
    message: str


class ComplianceResult(BaseModel):
    """
    Expected shape of the output returned by check_compliance().
    """
    overall_status: str
    risk_level: str
    checks: List[CheckItem]
    violations: List[ViolationItem]
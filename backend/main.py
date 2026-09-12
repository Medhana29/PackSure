from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from routes.auth import router as auth_router
from database import inspections_collection


app = FastAPI(title="NiyamNetra Authentication API")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTH ROUTES
# ============================================================

app.include_router(auth_router)


# ============================================================
# INSPECTION MODEL
# ============================================================

class InspectionCreate(BaseModel):
    inspection_id: str
    consumer_email: str
    product_name: str
    declarations: dict
    compliance_check: dict
    ocr_confidence: dict


class AuthorityDecision(BaseModel):
    decision: str


# ============================================================
# CREATE INSPECTION
# ONLY NON-COMPLIANT PRODUCTS ARE SENT TO GOVERNMENT
# ============================================================

@app.post("/api/inspections")
def create_inspection(inspection: InspectionCreate):

    compliance = inspection.compliance_check or {}

    overall_status = str(
        compliance.get("overall_status", "")
    ).upper()

    # --------------------------------------------------------
    # COMPLIANT PRODUCT
    # Do NOT send to Government
    # --------------------------------------------------------

    if overall_status != "VIOLATION":
        return {
            "message": "Inspection does not require authority review",
            "sent_for_review": False
        }

    # --------------------------------------------------------
    # Check whether this inspection already exists
    # --------------------------------------------------------

    existing = inspections_collection.find_one(
        {
            "inspection_id": inspection.inspection_id
        }
    )

    if existing:
        return {
            "message": "Inspection already sent for review",
            "sent_for_review": True,
            "authority_status": existing.get(
                "authority_status",
                "UNDER_REVIEW"
            )
        }

    # --------------------------------------------------------
    # Store inspection
    # --------------------------------------------------------

    document = {
        "inspection_id": inspection.inspection_id,
        "consumer_email": inspection.consumer_email,
        "product_name": inspection.product_name,

        "declarations": inspection.declarations,
        "compliance_check": inspection.compliance_check,
        "ocr_confidence": inspection.ocr_confidence,

        # Initial authority status
        "authority_status": "UNDER_REVIEW",

        "reviewed_at": None,
        "created_at": datetime.utcnow()
    }

    inspections_collection.insert_one(document)

    return {
        "message": "Inspection sent to Government Authority",
        "sent_for_review": True,
        "authority_status": "UNDER_REVIEW"
    }


# ============================================================
# GET GOVERNMENT INSPECTION QUEUE
# ============================================================

@app.get("/api/inspections")
def get_inspections():

    records = list(
        inspections_collection.find(
            {},
            {"_id": 0}
        ).sort(
            "created_at",
            -1
        )
    )

    return records


# ============================================================
# GOVERNMENT ACCEPT / REJECT
# ============================================================

@app.patch("/api/inspections/{inspection_id}/decision")
def update_authority_decision(
    inspection_id: str,
    decision: AuthorityDecision
):

    decision_value = decision.decision.upper()

    if decision_value not in [
        "ACCEPTED",
        "REJECTED"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Decision must be ACCEPTED or REJECTED"
        )

    result = inspections_collection.update_one(
        {
            "inspection_id": inspection_id
        },
        {
            "$set": {
                "authority_status": decision_value,
                "reviewed_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    return {
        "message": "Authority decision updated",
        "inspection_id": inspection_id,
        "authority_status": decision_value
    }


# ============================================================
# GET CONSUMER'S INSPECTIONS
# ============================================================

@app.get("/api/inspections/consumer/{email}")
def get_consumer_inspections(email: str):

    records = list(
        inspections_collection.find(
            {
                "consumer_email": email
            },
            {
                "_id": 0
            }
        ).sort(
            "created_at",
            -1
        )
    )

    return records


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "NiyamNetra Authentication API is running"
    }
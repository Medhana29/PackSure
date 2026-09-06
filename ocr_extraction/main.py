import cv2
import re
import json
from paddleocr import PaddleOCR
from fastapi import FastAPI, UploadFile, File
import os
import shutil

app = FastAPI()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)




# ============================================================
# 2. LOAD PADDLEOCR
# ============================================================

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=False
)


# ============================================================
# 3. OCR FUNCTION
# ============================================================

def run_ocr(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    result = ocr.predict(image)

    lines = []

    for r in result:

        data = r.json

        texts = data["res"]["rec_texts"]

        for text in texts:

            if text and text.strip():
                lines.append(text.strip())

    return lines



# ============================================================
# 8. CLEAN OCR
# ============================================================

def clean_line(line):

    line = line.strip()

    line = re.sub(r"\s+", " ", line)

    return line


# ============================================================
# 9. PRODUCT NAME
# ============================================================

def extract_product_name(front_lines):

    # Search the FRONT image first because the
    # product name is normally displayed prominently there.

    for line in front_lines:

        line_upper = line.upper()

        # OCR may produce different variations.
        # Look for KURKURE-like text.

        if "KURKURE" in line_upper:

            return "Kurkure"

    # Explicit product-name patterns

    for line in front_lines:

        match = re.search(
            r"(?:PRODUCT\s*NAME|PRODUCT)\s*[:\-]?\s*(.+)",
            line,
            re.IGNORECASE
        )

        if match:

            return match.group(1).strip()

    return None


# ============================================================
# 10. MRP
# ============================================================

def extract_mrp(lines):

    for line in lines:

        match = re.search(
            r"(?:MRP|M\.R\.P)"
            r"\s*(?:RS\.?|₹|INR)?"
            r"\s*[:.\-]?\s*"
            r"(\d+(?:\.\d+)?)",
            line,
            re.IGNORECASE
        )

        if match:

            return "₹" + match.group(1)

    return None


# ============================================================
# 11. NET QUANTITY
# ============================================================

def extract_net_quantity(lines):

    for i, line in enumerate(lines):

        if re.search(
            r"NET\s*(?:QTY|QUANTITY|WT|WEIGHT)",
            line,
            re.IGNORECASE
        ):

            # Check current line
            match = re.search(
                r"(\d+(?:\.\d+)?\s*(?:kg|g|mg|l|ml))",
                line,
                re.IGNORECASE
            )

            if match:
                return match.group(1)

            # Check nearby lines
            for nearby_line in lines[max(0, i-3):i+4]:

                match = re.search(
                    r"(\d+(?:\.\d+)?\s*(?:kg|g|mg|l|ml))",
                    nearby_line,
                    re.IGNORECASE
                )

                if match:
                    return match.group(1)

    return None


# ============================================================
# 12. MANUFACTURING DATE
# ============================================================

def extract_manufacturing_date(lines):

    keywords = [
        "MFD",
        "MFG",
        "MANUFACTURED",
        "MANUFACTURING",
        "PACKED",
        "PACKING"
    ]

    for i, line in enumerate(lines):

        if any(
            keyword in line.upper()
            for keyword in keywords
        ):

            # Search around the label
            nearby_lines = lines[
                max(0, i - 4):min(len(lines), i + 5)
            ]

            for nearby_line in nearby_lines:

                match = re.search(
                    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
                    nearby_line
                )

                if match:
                    return match.group(0)

    return None


# ============================================================
# 13. MANUFACTURER
# ============================================================

def extract_manufacturer(lines):

    keywords = [
        "MANUFACTURED BY",
        "MANUFACTURER",
        "PACKED BY",
        "PACKER",
        "IMPORTED BY",
        "IMPORTER",
        "MARKETED BY",
        "ARKETED BY"
    ]

    for i, line in enumerate(lines):

        upper_line = line.upper()

        if any(keyword in upper_line for keyword in keywords):

            nearby_lines = lines[i:i+5]

            for candidate in nearby_lines:

                candidate_upper = candidate.upper()

                if (
                    "PEPSICO" in candidate_upper
                    or "PVT. LTD" in candidate_upper
                    or "PVT LTD" in candidate_upper
                    or "LTD." in candidate_upper
                ):

                    candidate = re.sub(
                        r"^[^A-Za-z]*",
                        "",
                        candidate
                    )

                    candidate = re.sub(
                        r"^psiCo",
                        "PepsiCo",
                        candidate,
                        flags=re.IGNORECASE
                    )

                    return candidate.strip()

    return None


# ============================================================
# 14. CONSUMER CARE
# ============================================================

def extract_consumer_care(lines):

    phone = None
    email = None

    # Find phone number

    for line in lines:

        match = re.search(
            r"(?:CALL\s+US\s+AT|CONTACT|HELPLINE|TOLL\s*FREE)"
            r".{0,20}?"
            r"(\d[\d\s]{7,}\d)",
            line,
            re.IGNORECASE
        )

        if match:

            phone = re.sub(
                r"\s+",
                " ",
                match.group(1)
            ).strip()

            break

    # Find email

    for line in lines:

        match = re.search(
            r"[\w\.-]+@[\w\.-]+\.\w+",
            line
        )

        if match:

            email = match.group(0)

            break

    if phone and email:
        return f"Phone: {phone}; Email: {email}"

    if phone:
        return f"Phone: {phone}"

    if email:
        return f"Email: {email}"

    return None





@app.post("/api/scan")
def scan_product(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...)):
    front_image_path = os.path.join(
        UPLOAD_DIR,
        "front_" + front_image.filename
    )

    with open(front_image_path, "wb") as buffer:
        shutil.copyfileobj(
            front_image.file,
            buffer
        )


    # -------------------------------
    # Save back image
    # -------------------------------

    back_image_path = os.path.join(
        UPLOAD_DIR,
        "back_" + back_image.filename
    )

    with open(back_image_path, "wb") as buffer:
        shutil.copyfileobj(
            back_image.file,
            buffer
        )
    front_lines = run_ocr(front_image_path)

    back_lines = run_ocr(back_image_path)

    all_lines = front_lines + back_lines

    all_lines = [
        clean_line(line)
        for line in all_lines
        if line and line.strip()
    ]
    declarations = {

        "product_name": extract_product_name(front_lines),

        "manufacturer": extract_manufacturer(back_lines),

        "net_quantity": extract_net_quantity(back_lines),

        "mrp": extract_mrp(back_lines),

        "manufacturing_date": extract_manufacturing_date(back_lines),

        "consumer_care": extract_consumer_care(back_lines)
    }

    print("\n\n================ FINAL DECLARATIONS ================\n")

    print(
        json.dumps(
            declarations,
            indent=2,
            ensure_ascii=False
        )
    )
    return {
        "status": "success" if declarations else "failure",
        "declarations": declarations
    }


@app.get("/")
def root():
    return {"message": "Welcome to the OCR Extraction API!"}
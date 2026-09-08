import cv2
import re
import json
import os
import shutil

from paddleocr import PaddleOCR
from fastapi import FastAPI, UploadFile, File

from compliance.engine import check_compliance


app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# 1. LOAD PADDLEOCR
# ============================================================

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=False
)


# ============================================================
# 2. OCR
# ============================================================

def parse_ocr_result(result):

    lines = []

    for r in result:

        data = r.json

        if callable(data):
            data = data()

        if isinstance(data, str):
            data = json.loads(data)

        res = data.get("res", {})

        texts = res.get("rec_texts", [])
        scores = res.get("rec_scores", [])

        if hasattr(texts, "tolist"):
            texts = texts.tolist()

        if hasattr(scores, "tolist"):
            scores = scores.tolist()

        # Make sure both lists have values
        for text, score in zip(texts, scores):

            if text is None:
                continue

            text = str(text).strip()

            if text:

                lines.append({
                    "text": text,
                    "confidence": float(score)
                })

    return lines


def run_ocr(image_path):

    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(
            f"Could not read image: {image_path}"
        )

    images = [image]

    # --------------------------------------------------------
    # Create enlarged version for small printed text
    # --------------------------------------------------------

    h, w = image.shape[:2]

    if max(h, w) < 2500:

        enlarged = cv2.resize(
            image,
            None,
            fx=2,
            fy=2,
            interpolation=cv2.INTER_CUBIC
        )

        # Mild sharpening
        blurred = cv2.GaussianBlur(
            enlarged,
            (0, 0),
            1.2
        )

        sharpened = cv2.addWeighted(
            enlarged,
            1.35,
            blurred,
            -0.35,
            0
        )

        images.append(sharpened)

    # --------------------------------------------------------
    # Run OCR
    # --------------------------------------------------------

    all_lines = []

    for img in images:

        result = ocr.predict(img)

        parsed = parse_ocr_result(result)

        all_lines.extend(parsed)

    # --------------------------------------------------------
    # Remove duplicate lines
    # Keep the version with the highest confidence
    # --------------------------------------------------------

    best_lines = {}

    for item in all_lines:

        line = item["text"]
        confidence = item["confidence"]

        key = re.sub(
            r"\s+",
            " ",
            line
        ).strip().lower()

        if not key:
            continue

        if (
            key not in best_lines
            or confidence > best_lines[key]["confidence"]
        ):

            best_lines[key] = {
                "text": line.strip(),
                "confidence": confidence
            }

    ocr_lines = list(best_lines.values())

    # --------------------------------------------------------
    # Print OCR confidence
    # --------------------------------------------------------

    print(
        "\n================ OCR CONFIDENCE ================\n"
    )

    for item in ocr_lines:

        print(
            f"{item['text']} "
            f"(confidence: {item['confidence']:.2%})"
        )

    # --------------------------------------------------------
    # Return:
    #
    # 1. Plain text lines for existing extraction functions
    # 2. OCR details containing confidence
    # --------------------------------------------------------

    lines = [
        item["text"]
        for item in ocr_lines
    ]

    return lines, ocr_lines


# ============================================================
# 3. CLEAN OCR
# ============================================================

def clean_line(line):

    if not isinstance(line, str):
        return ""

    line = line.strip()

    line = re.sub(
        r"\s+",
        " ",
        line
    )

    # Common OCR mistakes
    replacements = {

        "Manufacturea": "Manufactured",
        "Manufacturec": "Manufactured",
        "Manufacturecl": "Manufactured",

        "Nct Quantity": "Net Quantity",
        "Nct": "Net",

        "Consuner": "Consumer",
        "consuner": "consumer",

        "CalIs": "Calls",
        "calIs": "calls"
    }

    for old, new in replacements.items():

        line = line.replace(
            old,
            new
        )

    return line


def normalize_lines(lines):

    result = []

    for line in lines:

        cleaned = clean_line(line)

        if cleaned:
            result.append(cleaned)

    return result


# ============================================================
# 4. COMMON PATTERNS
# ============================================================

DATE_PATTERN = re.compile(
    r"\b(?:0?[1-9]|[12]\d|3[01])[/-]"
    r"(?:0?[1-9]|1[0-2])[/-]"
    r"(?:\d{2}|\d{4})\b"
)


QUANTITY_PATTERN = re.compile(
    r"\b"
    r"(\d+(?:\.\d+)?)"
    r"\s*"
    r"(kg|kgs|g|gm|gms|mg|l|ltr|litre|litres|ml)"
    r"\b",
    re.IGNORECASE
)


PHONE_PATTERN = re.compile(
    r"(?<!\d)"
    r"([6-9]\d{9})"
    r"(?!\d)"
)


# ============================================================
# 5. PRODUCT NAME
# ============================================================

def extract_product_name(lines):

    # --------------------------------------------------------
    # Explicit PRODUCT NAME
    # --------------------------------------------------------

    for line in lines:

        match = re.search(
            r"\bPRODUCT\s*NAME\s*[:\-]?\s*(.+)",
            line,
            re.IGNORECASE
        )

        if match:

            value = match.group(1).strip()

            if value:
                return value

    # --------------------------------------------------------
    # Generic product-name detection
    # --------------------------------------------------------

    ignored = [

        "MADE WITH",
        "NO ARTIFICIAL",
        "ARTIFICIAL",
        "FLAVOUR",
        "FLAVOR",
        "SOURCE OF",
        "PREMIUM",
        "DELICIOUS",
        "TASTE",
        "DIETARY",
        "GLUTEN FREE",
        "TRANS FAT",
        "ZERO",
        "SLOW ROASTED",

        "INGREDIENT",
        "INGREDIENTS",

        "NUTRITION",
        "NUTRITIONAL",

        "SERVING",
        "ENERGY",
        "PROTEIN",
        "CARBOHYDRATE",
        "CALORIES",
        "SODIUM",
        "FAT",

        "RDA",

        "MRP",
        "NET QUANTITY",
        "BATCH",
        "MANUFACTURED",
        "PACKED BY",
        "MARKETED BY",
        "IMPORTED BY"
    ]

    candidates = []

    for index, raw_line in enumerate(lines):

        line = clean_line(raw_line)

        if len(line) < 3:
            continue

        upper = line.upper()

        if any(
            word in upper
            for word in ignored
        ):
            continue

        if DATE_PATTERN.search(line):
            continue

        if QUANTITY_PATTERN.search(line):
            continue

        if re.fullmatch(
            r"[\d\s%₹.,:/+\-()]+",
            line
        ):
            continue

        letters = sum(
            c.isalpha()
            for c in line
        )

        if letters < 3:
            continue

        score = 0

        if 4 <= len(line) <= 40:
            score += 3

        if 1 <= len(line.split()) <= 5:
            score += 3

        if letters / max(len(line), 1) >= 0.55:
            score += 2

        # Product-type signals
        if any(
            word in upper
            for word in [
                "SPREAD",
                "BUTTER",
                "BISCUIT",
                "COOKIE",
                "CHIPS",
                "SNACK",
                "NAMKEEN",
                "NOODLES",
                "SAUCE",
                "JAM",
                "DRINK",
                "JUICE",
                "CEREAL"
            ]
        ):
            score += 3

        candidates.append(
            (
                score,
                index,
                line
            )
        )

    if candidates:

        candidates.sort(
            key=lambda x: (
                x[0],
                -x[1]
            ),
            reverse=True
        )

        return candidates[0][2]

    return None


# ============================================================
# 6. MRP
# ============================================================

def extract_mrp(lines):

    patterns = [

        r"\bM\.?\s*R\.?\s*P\.?"
        r"\s*(?:₹|RS\.?|INR)?"
        r"\s*[:.\-]?"
        r"\s*(\d+(?:\.\d{1,2})?)",

        r"\bMRP\b"
        r"[^0-9]{0,15}"
        r"(\d+(?:\.\d{1,2})?)"
    ]

    for line in lines:

        for pattern in patterns:

            match = re.search(
                pattern,
                line,
                re.IGNORECASE
            )

            if match:

                return "₹" + match.group(1)

    return None


# ============================================================
# 7. NET QUANTITY
# ============================================================

def extract_net_quantity(lines):

    label_pattern = re.compile(
        r"\bNET\s*"
        r"(?:QTY|QUANTITY|WT|WEIGHT)\b",
        re.IGNORECASE
    )

    # --------------------------------------------------------
    # First try around Net Quantity
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if label_pattern.search(line):

            nearby = (
                lines[i:i + 6]
                +
                lines[max(0, i - 2):i]
            )

            for candidate in nearby:

                match = QUANTITY_PATTERN.search(
                    candidate
                )

                if match:

                    return match.group(0)

    # --------------------------------------------------------
    # OCR may completely miss "Net Quantity"
    # --------------------------------------------------------

    # Look for standalone package quantities.
    for line in reversed(lines):

        match = QUANTITY_PATTERN.search(line)

        if match:

            return match.group(0)

    return None


# ============================================================
# 8. MANUFACTURER
# ============================================================

def extract_manufacturer(lines):

    label_pattern = re.compile(
        r"MANUFACTURED\s*BY"
        r"|MANUFACTURER"
        r"|PACKED\s*BY"
        r"|PACKER"
        r"|IMPORTED\s*BY"
        r"|IMPORTER"
        r"|MARKETED\s*BY"
        r"|MARKETER",
        re.IGNORECASE
    )

    company_words = [

        "PVT",
        "PRIVATE",
        "LTD",
        "LIMITED",
        "LLP",
        "INC",
        "CORP",
        "CORPORATION",
        "COMPANY",
        "ENTERPRISES",
        "INDUSTRIES",
        "FOODS",
        "FOOD",
        "BEVERAGES",
        "PRODUCTS",
        "MANUFACTURING"
    ]

    for i, line in enumerate(lines):

        if not label_pattern.search(line):
            continue

        # ----------------------------------------------------
        # Same line
        # ----------------------------------------------------

        candidate = label_pattern.sub(
            "",
            line
        ).strip(
            " :-,"
        )

        if candidate:

            if any(
                word in candidate.upper()
                for word in company_words
            ):

                return candidate

        # ----------------------------------------------------
        # Following lines
        # ----------------------------------------------------

        for candidate in lines[
            i + 1:i + 7
        ]:

            candidate = clean_line(
                candidate
            )

            if not candidate:
                continue

            if label_pattern.search(
                candidate
            ):
                continue

            if re.search(
                r"\b"
                r"(INGREDIENTS|"
                r"NUTRITION|"
                r"NUTRITIONAL|"
                r"NET\s+QUANTITY|"
                r"MRP|"
                r"BATCH|"
                r"USE\s*BY)"
                r"\b",
                candidate,
                re.IGNORECASE
            ):
                break

            if any(
                word in candidate.upper()
                for word in company_words
            ):

                # Remove address after company name
                candidate = re.split(
                    r",\s*"
                    r"(?:PLOT|"
                    r"NO\.?|"
                    r"ADDRESS|"
                    r"DIST\.?|"
                    r"TA\.?|"
                    r"VILLAGE|"
                    r"ROAD|"
                    r"GIDC)\b",
                    candidate,
                    maxsplit=1,
                    flags=re.IGNORECASE
                )[0].strip(
                    " ,"
                )

                return candidate

    return None


# ============================================================
# 9. CONSUMER CARE
# ============================================================

def extract_consumer_care(lines):

    phone = None
    email = None

    priority_lines = []

    for line in lines:

        upper = line.upper()

        if any(
            word in upper
            for word in [

                "CONSUMER",
                "CARE",
                "CONTACT",
                "CALL",
                "HELPLINE",
                "COMPLAINT",
                "FEEDBACK",
                "TOLL",
                "EMAIL",
                "MAIL"
            ]
        ):

            priority_lines.append(
                line
            )

    search_lines = (
        priority_lines
        +
        [
            line
            for line in lines
            if line not in priority_lines
        ]
    )

    # --------------------------------------------------------
    # Normal phone detection
    # --------------------------------------------------------

    for line in search_lines:

        match = PHONE_PATTERN.search(
            line
        )

        if match:

            phone = match.group(1)

            break

    # --------------------------------------------------------
    # OCR fallback: O -> 0
    # --------------------------------------------------------

    if phone is None:

        for line in search_lines:

            normalized = (
                line
                .replace("O", "0")
                .replace("o", "0")
            )

            digits = re.sub(
                r"\D",
                "",
                normalized
            )

            for i in range(
                len(digits) - 9
            ):

                candidate = digits[
                    i:i + 10
                ]

                if (
                    len(candidate) == 10
                    and candidate[0] in "6789"
                ):

                    phone = candidate

                    break

            if phone:
                break

    # --------------------------------------------------------
    # Email
    # --------------------------------------------------------

    for line in lines:

        match = re.search(
            r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
            line
        )

        if match:

            email = match.group(0)

            break

    if phone and email:

        return (
            f"Phone: {phone}; "
            f"Email: {email}"
        )

    if phone:

        return (
            f"Phone: {phone}"
        )

    if email:

        return (
            f"Email: {email}"
        )

    return None


# ============================================================
# 10. MANUFACTURING DATE
# ============================================================

def extract_manufacturing_date(lines):

    label_pattern = re.compile(
        r"\b(?:MFD|MFG|"
        r"MANUFACTURED|"
        r"MANUFACTURING|"
        r"PACKED|"
        r"PACKING|"
        r"DATE\s+OF\s+MANUFACTURE)\b",
        re.IGNORECASE
    )

    # First: look around the label
    for i, line in enumerate(lines):

        if label_pattern.search(
            line
        ):

            nearby = (
                lines[i:i + 7]
                +
                lines[max(0, i - 2):i]
            )

            for candidate in nearby:

                match = DATE_PATTERN.search(
                    candidate
                )

                if match:

                    return match.group(0)

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    dates = []

    for line in lines:

        matches = DATE_PATTERN.findall(
            line
        )

        dates.extend(
            matches
        )

    if dates:

        return dates[0]

    return None


# ============================================================
# 11. BATCH NUMBER
# ============================================================

def extract_batch_no(lines):

    for i, line in enumerate(lines):

        if re.search(
            r"\bBATCH\b",
            line,
            re.IGNORECASE
        ):

            match = re.search(
                r"\bBATCH"
                r"(?:\s*NO\.?)?"
                r"\s*[:\-]?\s*"
                r"([A-Z0-9][A-Z0-9./_-]{2,})",
                line,
                re.IGNORECASE
            )

            if match:

                return match.group(1)

            for candidate in lines[
                i + 1:i + 3
            ]:

                candidate = candidate.strip()

                if re.fullmatch(
                    r"[A-Z0-9][A-Z0-9./_-]{2,}",
                    candidate,
                    re.IGNORECASE
                ):

                    return candidate

    return None


# ============================================================
# 12. USE BY / EXPIRY
# ============================================================

def extract_use_by(lines):

    label_pattern = re.compile(
        r"\b(?:USE\s*BY|"
        r"BEST\s*BEFORE|"
        r"EXPIRY|"
        r"EXP)\b",
        re.IGNORECASE
    )

    for i, line in enumerate(lines):

        if label_pattern.search(
            line
        ):

            nearby = lines[
                i:i + 6
            ]

            for candidate in nearby:

                match = DATE_PATTERN.search(
                    candidate
                )

                if match:

                    return match.group(0)

    dates = []

    for line in lines:

        dates.extend(
            DATE_PATTERN.findall(
                line
            )
        )

    if len(dates) >= 2:

        return dates[-1]

    return None


# ============================================================
# 13. API
# ============================================================

@app.post("/api/scan")
def scan_product(

    front_image: UploadFile = File(...),

    back_image: UploadFile = File(...)

):

    # --------------------------------------------------------
    # Save front image
    # --------------------------------------------------------

    front_filename = (
        "front_"
        +
        os.path.basename(
            front_image.filename
        )
    )

    front_image_path = os.path.join(
        UPLOAD_DIR,
        front_filename
    )

    with open(
        front_image_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            front_image.file,
            buffer
        )

    # --------------------------------------------------------
    # Save back image
    # --------------------------------------------------------

    back_filename = (
        "back_"
        +
        os.path.basename(
            back_image.filename
        )
    )

    back_image_path = os.path.join(
        UPLOAD_DIR,
        back_filename
    )

    with open(
        back_image_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            back_image.file,
            buffer
        )

    # --------------------------------------------------------
    # OCR BOTH images
    # --------------------------------------------------------

    front_lines, front_ocr_details = run_ocr(
        front_image_path
    )

    back_lines, back_ocr_details = run_ocr(
        back_image_path
    )

    # IMPORTANT:
    # Do not extract only from back_lines.
    all_lines = (
        front_lines
        +
        back_lines
    )

    # --------------------------------------------------------
    # Print OCR for debugging
    # --------------------------------------------------------

    print(
        "\n================ FRONT OCR ================\n"
    )

    for item in front_ocr_details:

        print(
            f"{item['text']} "
            f"(confidence: {item['confidence']:.2%})"
        )

    print(
        "\n================ BACK OCR ================\n"
    )

    for item in back_ocr_details:

        print(
            f"{item['text']} "
            f"(confidence: {item['confidence']:.2%})"
        )

    # --------------------------------------------------------
    # EXTRACT
    # --------------------------------------------------------

    declarations = {

        "product_name":
            extract_product_name(
                front_lines
            )
            or
            extract_product_name(
                all_lines
            ),

        "manufacturer":
            extract_manufacturer(
                all_lines
            ),

        "net_quantity":
            extract_net_quantity(
                all_lines
            ),

        "mrp":
            extract_mrp(
                all_lines
            ),

        "manufacturing_date":
            extract_manufacturing_date(
                all_lines
            ),

        "consumer_care":
            extract_consumer_care(
                all_lines
            ),

        "batch_no":
            extract_batch_no(
                all_lines
            ),

        "use_by":
            extract_use_by(
                all_lines
            )
    }

    # --------------------------------------------------------
    # FINAL OUTPUT
    # --------------------------------------------------------

    print(
        "\n================ FINAL DECLARATIONS ================\n"
    )

    print(
        json.dumps(
            declarations,
            indent=2,
            ensure_ascii=False
        )
    )

    # --------------------------------------------------------
    # OCR CONFIDENCE SUMMARY
    # --------------------------------------------------------

    all_ocr_details = (
        front_ocr_details
        +
        back_ocr_details
    )

    if all_ocr_details:

        average_confidence = (
            sum(
                item["confidence"]
                for item in all_ocr_details
            )
            /
            len(all_ocr_details)
        )

    else:

        average_confidence = 0.0

    confidence_summary = {

        "average_confidence":
            round(
                average_confidence,
                4
            ),

        "average_confidence_percent":
            round(
                average_confidence * 100,
                2
            ),

        "total_ocr_lines":
            len(all_ocr_details),

        "lines": all_ocr_details
    }

    print(
        "\n================ OCR CONFIDENCE SUMMARY ================\n"
    )

    print(
        json.dumps(
            confidence_summary,
            indent=2,
            ensure_ascii=False
        )
    )

    # --------------------------------------------------------
    # COMPLIANCE
    # --------------------------------------------------------

    try:

        compliance_result = check_compliance(
            declarations
        )

    except Exception as e:

        compliance_result = {

            "overall_status":
                "REVIEW_REQUIRED",

            "risk_level":
                "HIGH",

            "error":
                str(e)
        }

    # --------------------------------------------------------
    # API RESPONSE
    # --------------------------------------------------------

    return {

        "status":
            "success",

        "declarations":
            declarations,

        "ocr_confidence":
            confidence_summary,

        "compliance_check":
            compliance_result
    }


# ============================================================
# 14. ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "Welcome to the PackSure OCR Extraction API!"
    }
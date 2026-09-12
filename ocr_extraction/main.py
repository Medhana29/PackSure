import cv2
import re
import json
import os
import shutil

from paddleocr import PaddleOCR
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from compliance.engine import check_compliance


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI()


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
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# 1. LOAD PADDLEOCR
# ============================================================

print("\n" + "=" * 60, flush=True)
print("[SYSTEM] Loading PaddleOCR...", flush=True)
print("=" * 60, flush=True)

ocr = PaddleOCR(
    lang="en",
    enable_mkldnn=False
)

print("[SYSTEM] PaddleOCR loaded successfully.", flush=True)


# ============================================================
# 2. PARSE PADDLEOCR RESULT
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

        for text, score in zip(texts, scores):

            if text is None:
                continue

            text = str(text).strip()

            if text:

                lines.append(
                    {
                        "text": text,
                        "confidence": float(score)
                    }
                )

    return lines


# ============================================================
# 3. RUN OCR
# ============================================================

def run_ocr(image_path):

    print("\n" + "=" * 60, flush=True)
    print(f"[OCR] Starting OCR for: {image_path}", flush=True)
    print("=" * 60, flush=True)

    image = cv2.imread(image_path)

    if image is None:

        raise ValueError(
            f"Could not read image: {image_path}"
        )

    h, w = image.shape[:2]

    print(
        f"[OCR] Image size: {w} x {h}",
        flush=True
    )

    # --------------------------------------------------------
    # Resize only if image is small
    # --------------------------------------------------------

    if max(h, w) < 1500:

        scale = 1500 / max(h, w)

        image = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC
        )

        print(
            f"[OCR] Image resized to: "
            f"{image.shape[1]} x {image.shape[0]}",
            flush=True
        )

    # --------------------------------------------------------
    # Run PaddleOCR
    # --------------------------------------------------------

    print(
        "[OCR] Running PaddleOCR...",
        flush=True
    )

    result = ocr.predict(image)

    print(
        "[OCR] PaddleOCR finished. Parsing result...",
        flush=True
    )

    parsed = parse_ocr_result(result)

    # --------------------------------------------------------
    # Remove duplicate lines
    # Keep highest confidence
    # --------------------------------------------------------

    best_lines = {}

    for item in parsed:

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

    print(
        f"[OCR] Extracted "
        f"{len(ocr_lines)} unique text lines.",
        flush=True
    )

    # --------------------------------------------------------
    # Print OCR confidence
    # --------------------------------------------------------

    print(
        "\n================ OCR CONFIDENCE ================",
        flush=True
    )

    for item in ocr_lines:

        print(
            f"{item['text']} "
            f"(confidence: {item['confidence']:.2%})",
            flush=True
        )

    print(
        "=================================================\n",
        flush=True
    )

    lines = [
        item["text"]
        for item in ocr_lines
    ]

    print(
        "[OCR] OCR processing completed successfully.",
        flush=True
    )

    return lines, ocr_lines


# ============================================================
# 4. CLEAN OCR LINE
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

    # --------------------------------------------------------
    # Common OCR mistakes
    # --------------------------------------------------------

    replacements = {

        # Manufacturing
        "Manufacturea": "Manufactured",
        "Manufacturec": "Manufactured",
        "Manufacturecl": "Manufactured",
        "Manufacturinq": "Manufacturing",
        "Manufacluring": "Manufacturing",

        # Net Quantity
        "Nct Quantity": "Net Quantity",
        "Nct": "Net",

        # Consumer
        "Consuner": "Consumer",
        "consuner": "consumer",

        # Calls
        "CalIs": "Calls",
        "calIs": "calls",

        # MRP
        "M.R.P": "MRP",
        "M.R.P.": "MRP"
    }

    for old, new in replacements.items():

        line = line.replace(
            old,
            new
        )

    return line


# ============================================================
# 5. NORMALIZE LINES
# ============================================================

def normalize_lines(lines):

    result = []

    for line in lines:

        cleaned = clean_line(line)

        if cleaned:
            result.append(cleaned)

    return result


# ============================================================
# 6. COMMON PATTERNS
# ============================================================

# ------------------------------------------------------------
# DATE
#
# Supports:
# 08/2026
# 08-2026
# 08/26
# 08-26
# 08/08/2026
# August 2026
# ------------------------------------------------------------

DATE_PATTERN = re.compile(
    r"\b(?:"
    
    # DD/MM/YYYY
    r"(?:0?[1-9]|[12]\d|3[01])"
    r"[/-]"
    r"(?:0?[1-9]|1[0-2])"
    r"[/-]"
    r"(?:\d{2}|\d{4})"

    r"|"

    # MM/YYYY
    r"(?:0?[1-9]|1[0-2])"
    r"[/-]"
    r"\d{4}"

    r"|"

    # MM/YY
    r"(?:0?[1-9]|1[0-2])"
    r"[/-]"
    r"\d{2}"

    r"|"

    # Month YYYY
    r"(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|"
    r"AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)"
    r"\s+\d{4}"

    r")\b",
    re.IGNORECASE
)


# ------------------------------------------------------------
# QUANTITY
#
# Supports:
# 5 kg
# 500 g
# 1 kg
# 1.5 kg
# 500 ml
# 1 L
# ------------------------------------------------------------

QUANTITY_PATTERN = re.compile(
    r"\b"
    r"(\d+(?:\.\d+)?)"
    r"\s*"
    r"(kg|kgs|g|gm|gms|mg|l|ltr|litre|litres|ml)"
    r"\b",
    re.IGNORECASE
)


# ------------------------------------------------------------
# PHONE
# ------------------------------------------------------------

PHONE_PATTERN = re.compile(
    r"(?<!\d)"
    r"([6-9]\d{9})"
    r"(?!\d)"
)


# ============================================================
# 7. PRODUCT NAME
# ============================================================

def extract_product_name(lines):

    print(
        "\n[EXTRACT] Searching for Product Name...",
        flush=True
    )

    # --------------------------------------------------------
    # 1. Explicit PRODUCT NAME
    #
    # Example:
    # Product Name : Premium Basmati Rice
    # --------------------------------------------------------

    product_patterns = [

        re.compile(
            r"\bPRODUCT\s+NAME\b"
            r"\s*[:\-]?\s*(.+)",
            re.IGNORECASE
        ),

        re.compile(
            r"\bPRODUCT\b"
            r"\s*[:\-]\s*(.+)",
            re.IGNORECASE
        )
    ]

    for line in lines:

        line = clean_line(line)

        for pattern in product_patterns:

            match = pattern.search(line)

            if match:

                value = match.group(1).strip()

                value = value.strip(" :-")

                if value:

                    print(
                        f"[EXTRACT] Product Name found: "
                        f"{value}",
                        flush=True
                    )

                    return value

    # --------------------------------------------------------
    # 2. Product Name split into two lines
    #
    # Product Name
    # Premium Basmati Rice
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if re.search(
            r"\bPRODUCT\s+NAME\b",
            line,
            re.IGNORECASE
        ):

            for candidate in lines[i + 1:i + 4]:

                candidate = clean_line(candidate)

                if not candidate:
                    continue

                if re.search(
                    r"\b(?:MRP|MANUFACTURER|"
                    r"NET\s+QUANTITY|DATE|"
                    r"CONSUMER|CARE)\b",
                    candidate,
                    re.IGNORECASE
                ):
                    continue

                if len(candidate) >= 3:

                    print(
                        f"[EXTRACT] Product Name found "
                        f"on next line: {candidate}",
                        flush=True
                    )

                    return candidate

    # --------------------------------------------------------
    # 3. Generic fallback
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
        "MANUFACTURER",
        "PACKED BY",
        "MARKETED BY",
        "IMPORTED BY",

        "CONSUMER CARE",
        "CUSTOMER CARE"
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

        if 4 <= len(line) <= 50:
            score += 3

        if 1 <= len(line.split()) <= 7:
            score += 3

        if letters / max(len(line), 1) >= 0.55:
            score += 2

        # Product type signals
        if any(
            word in upper
            for word in [

                "RICE",
                "BASMATI",
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

        result = candidates[0][2]

        print(
            f"[EXTRACT] Product Name fallback: "
            f"{result}",
            flush=True
        )

        return result

    print(
        "[EXTRACT] Product Name NOT found.",
        flush=True
    )

    return None


# ============================================================
# 8. MRP
# ============================================================

def extract_mrp(lines):

    print(
        "\n[EXTRACT] Searching for MRP...",
        flush=True
    )

    # --------------------------------------------------------
    # Supports:
    #
    # MRP: ₹650.00
    # MRP ₹650.00
    # MRP: Rs. 650
    # MRP Rs 650
    # M.R.P: 650
    # Maximum Retail Price: ₹650
    # --------------------------------------------------------

    mrp_patterns = [

        # MRP ₹650
        re.compile(
            r"\bM\s*\.?\s*R\s*\.?\s*P\s*\.?"
            r"\s*[:\-]?\s*"
            r"(?:₹|RS\.?|INR)?"
            r"\s*"
            r"(\d+(?:\.\d{1,2})?)",
            re.IGNORECASE
        ),

        # Maximum Retail Price
        re.compile(
            r"\bMAXIMUM\s+RETAIL\s+PRICE\b"
            r"\s*[:\-]?\s*"
            r"(?:₹|RS\.?|INR)?"
            r"\s*"
            r"(\d+(?:\.\d{1,2})?)",
            re.IGNORECASE
        ),

        # MRP somewhere before number
        re.compile(
            r"\bMRP\b"
            r"[^0-9₹]{0,30}"
            r"(?:₹|RS\.?|INR)?"
            r"\s*"
            r"(\d+(?:\.\d{1,2})?)",
            re.IGNORECASE
        )
    ]

    # --------------------------------------------------------
    # Search same line
    # --------------------------------------------------------

    for line in lines:

        line = clean_line(line)

        for pattern in mrp_patterns:

            match = pattern.search(line)

            if match:

                value = match.group(1)

                result = f"₹{value}"

                print(
                    f"[EXTRACT] MRP found: {result}",
                    flush=True
                )

                return result

    # --------------------------------------------------------
    # OCR may split:
    #
    # MRP
    # ₹650.00
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if re.search(
            r"\bM\s*\.?\s*R\s*\.?\s*P\s*\.?\b",
            line,
            re.IGNORECASE
        ):

            nearby = lines[i:i + 4]

            for candidate in nearby:

                candidate = clean_line(candidate)

                match = re.search(
                    r"(?:₹|RS\.?|INR)?"
                    r"\s*"
                    r"(\d+(?:\.\d{1,2})?)",
                    candidate,
                    re.IGNORECASE
                )

                if match:

                    value = match.group(1)

                    if float(value) > 0:

                        result = f"₹{value}"

                        print(
                            f"[EXTRACT] MRP found "
                            f"on nearby line: {result}",
                            flush=True
                        )

                        return result

    print(
        "[EXTRACT] MRP NOT found.",
        flush=True
    )

    return None


# ============================================================
# 9. NET QUANTITY
# ============================================================

def extract_net_quantity(lines):

    print(
        "\n[EXTRACT] Searching for Net Quantity...",
        flush=True
    )

    label_pattern = re.compile(
        r"\bNET\s+"
        r"(?:QTY|QUANTITY|WT|WEIGHT)\b",
        re.IGNORECASE
    )

    # --------------------------------------------------------
    # First: search around Net Quantity
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

                    result = match.group(0)

                    print(
                        f"[EXTRACT] Net Quantity found: "
                        f"{result}",
                        flush=True
                    )

                    return result

    # --------------------------------------------------------
    # Fallback:
    # Look for package quantities
    # --------------------------------------------------------

    for line in reversed(lines):

        match = QUANTITY_PATTERN.search(line)

        if match:

            result = match.group(0)

            print(
                f"[EXTRACT] Net Quantity fallback: "
                f"{result}",
                flush=True
            )

            return result

    print(
        "[EXTRACT] Net Quantity NOT found.",
        flush=True
    )

    return None


# ============================================================
# 10. MANUFACTURER
# ============================================================

def extract_manufacturer(lines):

    print(
        "\n[EXTRACT] Searching for Manufacturer...",
        flush=True
    )

    label_pattern = re.compile(
        r"MANUFACTURED\s+BY"
        r"|MANUFACTURER"
        r"|PACKED\s+BY"
        r"|PACKER"
        r"|IMPORTED\s+BY"
        r"|IMPORTER"
        r"|MARKETED\s+BY"
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
        ).strip(" :-,")

        if candidate:

            if any(
                word in candidate.upper()
                for word in company_words
            ):

                print(
                    f"[EXTRACT] Manufacturer found: "
                    f"{candidate}",
                    flush=True
                )

                return candidate

        # ----------------------------------------------------
        # Following lines
        # ----------------------------------------------------

        for candidate in lines[i + 1:i + 7]:

            candidate = clean_line(candidate)

            if not candidate:
                continue

            if label_pattern.search(candidate):
                continue

            if re.search(
                r"\b("
                r"INGREDIENTS|"
                r"NUTRITION|"
                r"NUTRITIONAL|"
                r"NET\s+QUANTITY|"
                r"MRP|"
                r"BATCH|"
                r"USE\s+BY"
                r")\b",
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
                )[0].strip(" ,")

                print(
                    f"[EXTRACT] Manufacturer found: "
                    f"{candidate}",
                    flush=True
                )

                return candidate

    print(
        "[EXTRACT] Manufacturer NOT found.",
        flush=True
    )

    return None


# ============================================================
# 11. CONSUMER CARE
# ============================================================

def extract_consumer_care(lines):

    print(
        "\n[EXTRACT] Searching for Consumer Care...",
        flush=True
    )

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

            priority_lines.append(line)

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

        match = PHONE_PATTERN.search(line)

        if match:

            phone = match.group(1)

            break

    # --------------------------------------------------------
    # OCR fallback:
    # O -> 0
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
                max(0, len(digits) - 9)
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

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    if phone and email:

        result = (
            f"Phone: {phone}; "
            f"Email: {email}"
        )

        print(
            f"[EXTRACT] Consumer Care found: "
            f"{result}",
            flush=True
        )

        return result

    if phone:

        result = f"Phone: {phone}"

        print(
            f"[EXTRACT] Consumer Care found: "
            f"{result}",
            flush=True
        )

        return result

    if email:

        result = f"Email: {email}"

        print(
            f"[EXTRACT] Consumer Care found: "
            f"{result}",
            flush=True
        )

        return result

    print(
        "[EXTRACT] Consumer Care NOT found.",
        flush=True
    )

    return None


# ============================================================
# 12. MANUFACTURING DATE
# ============================================================

def extract_manufacturing_date(lines):

    print(
        "\n[EXTRACT] Searching for Manufacturing Date...",
        flush=True
    )

    label_pattern = re.compile(
        r"\b(?:"
        r"MFD|"
        r"MFG|"
        r"MANUFACTURED|"
        r"MANUFACTURING|"
        r"DATE\s+OF\s+MANUFACTURE|"
        r"DATE\s+OF\s+MANUFACTURING|"
        r"DATE\s+OF\s+PACKING|"
        r"PACKED|"
        r"PACKING"
        r")\b",
        re.IGNORECASE
    )

    # --------------------------------------------------------
    # Search near manufacturing label
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if label_pattern.search(line):

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

                    result = match.group(0)

                    print(
                        f"[EXTRACT] Manufacturing Date "
                        f"found: {result}",
                        flush=True
                    )

                    return result

    # --------------------------------------------------------
    # Specifically handle:
    #
    # Date of Manufacturing
    # 08/2026
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if re.search(
            r"DATE\s+OF\s+"
            r"(?:MANUFACTURING|MANUFACTURE|PACKING)",
            line,
            re.IGNORECASE
        ):

            for candidate in lines[i:i + 5]:

                match = DATE_PATTERN.search(
                    candidate
                )

                if match:

                    result = match.group(0)

                    print(
                        f"[EXTRACT] Manufacturing Date "
                        f"found: {result}",
                        flush=True
                    )

                    return result

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    dates = []

    for line in lines:

        matches = DATE_PATTERN.findall(line)

        dates.extend(matches)

    if dates:

        result = dates[0]

        print(
            f"[EXTRACT] Manufacturing Date "
            f"fallback: {result}",
            flush=True
        )

        return result

    print(
        "[EXTRACT] Manufacturing Date NOT found.",
        flush=True
    )

    return None


# ============================================================
# 13. BATCH NUMBER
# ============================================================

def extract_batch_no(lines):

    print(
        "\n[EXTRACT] Searching for Batch Number...",
        flush=True
    )

    for i, line in enumerate(lines):

        if re.search(
            r"\bBATCH\b",
            line,
            re.IGNORECASE
        ):

            # ------------------------------------------------
            # Same line
            # ------------------------------------------------

            match = re.search(
                r"\bBATCH"
                r"(?:\s+NO\.?)?"
                r"\s*[:\-]?\s*"
                r"([A-Z0-9][A-Z0-9./_-]{2,})",
                line,
                re.IGNORECASE
            )

            if match:

                result = match.group(1)

                print(
                    f"[EXTRACT] Batch Number found: "
                    f"{result}",
                    flush=True
                )

                return result

            # ------------------------------------------------
            # Following lines
            # ------------------------------------------------

            for candidate in lines[i + 1:i + 3]:

                candidate = candidate.strip()

                if re.fullmatch(
                    r"[A-Z0-9][A-Z0-9./_-]{2,}",
                    candidate,
                    re.IGNORECASE
                ):

                    print(
                        f"[EXTRACT] Batch Number found: "
                        f"{candidate}",
                        flush=True
                    )

                    return candidate

    print(
        "[EXTRACT] Batch Number NOT found.",
        flush=True
    )

    return None


# ============================================================
# 14. USE BY / EXPIRY
# ============================================================

def extract_use_by(lines):

    print(
        "\n[EXTRACT] Searching for Use By / Expiry...",
        flush=True
    )

    label_pattern = re.compile(
        r"\b(?:"
        r"USE\s+BY|"
        r"BEST\s+BEFORE|"
        r"EXPIRY|"
        r"EXP"
        r")\b",
        re.IGNORECASE
    )

    # --------------------------------------------------------
    # Search around label
    # --------------------------------------------------------

    for i, line in enumerate(lines):

        if label_pattern.search(line):

            nearby = lines[i:i + 6]

            for candidate in nearby:

                match = DATE_PATTERN.search(
                    candidate
                )

                if match:

                    result = match.group(0)

                    print(
                        f"[EXTRACT] Use By / Expiry "
                        f"found: {result}",
                        flush=True
                    )

                    return result

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    dates = []

    for line in lines:

        dates.extend(
            DATE_PATTERN.findall(line)
        )

    if len(dates) >= 2:

        result = dates[-1]

        print(
            f"[EXTRACT] Use By / Expiry "
            f"fallback: {result}",
            flush=True
        )

        return result

    print(
        "[EXTRACT] Use By / Expiry NOT found.",
        flush=True
    )

    return None


# ============================================================
# 15. API - SCAN PRODUCT
# ============================================================

@app.post("/api/scan")
def scan_product(

    front_image: UploadFile = File(...),

    back_image: UploadFile = File(...)
):

    print("\n")
    print("=" * 70)
    print("[SCAN] NEW PRODUCT SCAN STARTED")
    print("=" * 70)

    # ========================================================
    # SAVE FRONT IMAGE
    # ========================================================

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

    print(
        f"[SCAN] Front image saved: "
        f"{front_image_path}",
        flush=True
    )

    # ========================================================
    # SAVE BACK IMAGE
    # ========================================================

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

    print(
        f"[SCAN] Back image saved: "
        f"{back_image_path}",
        flush=True
    )

    # ========================================================
    # OCR FRONT IMAGE
    # ========================================================

    print(
        "\n[SCAN] Processing FRONT image...",
        flush=True
    )

    front_lines, front_ocr_details = run_ocr(
        front_image_path
    )

    # ========================================================
    # OCR BACK IMAGE
    # ========================================================

    print(
        "\n[SCAN] Processing BACK image...",
        flush=True
    )

    back_lines, back_ocr_details = run_ocr(
        back_image_path
    )

    # ========================================================
    # COMBINE OCR
    # ========================================================

    all_lines = (
        front_lines
        +
        back_lines
    )

    # Normalize
    all_lines = normalize_lines(
        all_lines
    )

    print(
        "\n[SCAN] Total OCR lines available: "
        f"{len(all_lines)}",
        flush=True
    )

    # ========================================================
    # PRINT FRONT OCR
    # ========================================================

    print(
        "\n================ FRONT OCR ================"
    )

    for item in front_ocr_details:

        print(
            f"{item['text']} "
            f"(confidence: "
            f"{item['confidence']:.2%})"
        )

    # ========================================================
    # PRINT BACK OCR
    # ========================================================

    print(
        "\n================ BACK OCR ================"
    )

    for item in back_ocr_details:

        print(
            f"{item['text']} "
            f"(confidence: "
            f"{item['confidence']:.2%})"
        )

    # ========================================================
    # EXTRACT DECLARATIONS
    # ========================================================

    print(
        "\n"
        + "=" * 70
    )

    print(
        "[EXTRACT] STARTING DECLARATION EXTRACTION"
    )

    print(
        "=" * 70
    )

    # --------------------------------------------------------
    # Product Name
    # Prefer front image first
    # --------------------------------------------------------

    product_name = extract_product_name(
        front_lines
    )

    if not product_name:

        product_name = extract_product_name(
            all_lines
        )

    # --------------------------------------------------------
    # All other declarations
    # --------------------------------------------------------

    declarations = {

        "product_name":
            product_name,

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

    # ========================================================
    # FINAL DECLARATIONS
    # ========================================================

    print(
        "\n"
        + "=" * 70
    )

    print(
        "================ FINAL DECLARATIONS ================"
    )

    print(
        "=" * 70
    )

    print(
        json.dumps(
            declarations,
            indent=2,
            ensure_ascii=False
        )
    )

    # ========================================================
    # OCR CONFIDENCE SUMMARY
    # ========================================================

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

        "lines":
            all_ocr_details
    }

    print(
        "\n"
        + "=" * 70
    )

    print(
        "================ OCR CONFIDENCE SUMMARY ================"
    )

    print(
        "=" * 70
    )

    print(
        json.dumps(
            confidence_summary,
            indent=2,
            ensure_ascii=False
        )
    )

    # ========================================================
    # COMPLIANCE
    # ========================================================

    print(
        "\n"
        + "=" * 70
    )

    print(
        "[COMPLIANCE] Checking product compliance..."
    )

    print(
        "=" * 70
    )

    try:

        compliance_result = check_compliance(
            declarations
        )

        print(
            "[COMPLIANCE] Compliance check completed.",
            flush=True
        )

    except Exception as e:

        print(
            "[COMPLIANCE] ERROR:",
            str(e),
            flush=True
        )

        compliance_result = {

            "overall_status":
                "REVIEW_REQUIRED",

            "risk_level":
                "HIGH",

            "error":
                str(e)
        }

    # ========================================================
    # FINAL API RESPONSE
    # ========================================================

    print(
        "\n"
        + "=" * 70
    )

    print(
        "[SCAN] SCAN COMPLETED"
    )

    print(
        "=" * 70
    )

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
# 16. ROOT
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "Welcome to the NiyamNetra OCR Extraction API!"
    }
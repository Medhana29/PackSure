# NiyamNetra — clean prototype

NiyamNetra checks packaged-commodity declarations using:
IMAGE → OCR → DECLARATIONS → COMPLIANCE → RESULTS

## Structure
- frontend: React + Vite consumer/manufacturer/government UI
- backend: FastAPI + MongoDB + bcrypt + JWT for real consumer authentication
- ocr_extraction: FastAPI OCR endpoint on port 8000
- compliance: rule engine used by OCR API

## Ports
- Frontend: 5173
- Consumer auth API: 8001
- OCR + compliance API: 8000

## 1. Backend authentication
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `.env` from `.env.example` and put your MongoDB URI and a strong JWT secret.

Run:
```powershell
python -m uvicorn main:app --reload --port 8001
```

Swagger:
http://127.0.0.1:8001/docs

## 2. OCR + compliance
Use your PaddleOCR environment or create one:
```powershell
cd ocr_extraction
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

From the NiyamNetra root:
```powershell
python -m uvicorn ocr_extraction.main:app --reload --port 8000
```

## 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open:
http://localhost:5173

## Demo Product Owner accounts
- owner1@niyamnetra.demo / owner123
- owner2@niyamnetra.demo / owner456
- owner3@niyamnetra.demo / owner789
- owner4@niyamnetra.demo / owner321
- owner5@niyamnetra.demo / owner654

## Demo Government accounts
- authority1@niyamnetra.demo / gov123
- authority2@niyamnetra.demo / gov456
- authority3@niyamnetra.demo / gov789
- authority4@niyamnetra.demo / gov321
- authority5@niyamnetra.demo / gov654

These two datasets are presentation/demo authentication, not production security.

## Consumer authentication
Consumer registration/login is real and stored in MongoDB. Passwords are bcrypt-hashed and login returns a JWT.

## History and search
History is NOT mock data. Every successful OCR scan is stored in browser localStorage with its actual OCR declarations, compliance result, inspection ID and timestamp. Search reads that same real scan history.

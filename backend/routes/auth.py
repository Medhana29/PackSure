import os
import bcrypt
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel, EmailStr

from database import users_collection
from models.user import create_user

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing in backend/.env")


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register_user(data: RegisterRequest):
    email = str(data.email).lower().strip()

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    password_hash = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user_id = create_user(
        name=data.name,
        email=email,
        password_hash=password_hash,
        role="consumer"
    )

    return {"message": "Registration successful", "user_id": user_id}


@router.post("/login")
def login_user(data: LoginRequest):
    email = str(data.email).lower().strip()
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_ok = bcrypt.checkpw(
        data.password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not password_ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    now = datetime.now(timezone.utc)
    token_data = {
        "user_id": str(user["_id"]),
        "role": user["role"],
        "exp": now + timedelta(hours=2),
    }

    token = jwt.encode(token_data, JWT_SECRET, algorithm=ALGORITHM)

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models import User

# JWT Secret Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hazardhawk-safety-analytics-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with cryptographically secure random salt."""
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}:{hashed.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password against stored salt and PBKDF2 hash."""
    try:
        salt_hex, hash_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        new_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(new_hash.hex(), hash_hex)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT access token with expiration timestamp."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """FastAPI dependency to extract and verify the current authenticated user."""
    if not credentials:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload["sub"]
    with SessionLocal() as session:
        statement = select(User).where(User.email == email)
        user = session.scalars(statement).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists.",
            )

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "dob": getattr(user, "dob", "") or "1994-08-15",
            "age": getattr(user, "age", 30) or 30,
            "blood_group": getattr(user, "blood_group", "") or "O+",
            "mobile_no": getattr(user, "mobile_no", "") or "+91 98765 43210",
            "designation": getattr(user, "designation", "") or (user.role or "Worker"),
            "shift": getattr(user, "shift", "") or "Morning Shift (07:00 AM - 03:30 PM)",
            "timetable": getattr(user, "timetable", "") or "07:00 AM Toolbox briefing | 07:30 AM Safety Harness Check | 12:30 PM Lunch | 15:00 PM Shift Log",
            "assigned_sector": getattr(user, "assigned_sector", "") or "Zone B — Perimeter Scaffolding (Level 7)",
            "created_at": user.created_at.isoformat(),
        }


def require_current_user(
    current_user: Optional[dict] = Depends(get_current_user),
) -> dict:
    """Enforce authentication requirement on sensitive endpoints."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer JWT token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

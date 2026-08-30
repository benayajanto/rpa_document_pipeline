from __future__ import annotations

import datetime
import os

import jwt
from fastapi import HTTPException, Request

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24 * 7


def create_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except jwt.PyJWTError:
        return None


def get_current_user_id(request: Request) -> int:
    """FastAPI dependency: extracts and validates the bearer token, returns the user id."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing or invalid Authorization header")

    user_id = decode_token(auth_header.removeprefix("Bearer ").strip())
    if user_id is None:
        raise HTTPException(status_code=401, detail="invalid or expired token")

    return user_id

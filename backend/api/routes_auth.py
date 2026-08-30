from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from werkzeug.security import check_password_hash, generate_password_hash

from backend.api.schemas import AuthResponse, LoginRequest, SignupRequest, UserOut
from backend.auth import create_token
from backend.database.db import get_db
from backend.database.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    password = body.password
    name = body.name.strip()

    if not email or not password or not name:
        raise HTTPException(status_code=400, detail="email, password, and name are required")

    if db.query(User).filter_by(email=email).first():
        raise HTTPException(status_code=409, detail="an account with that email already exists")

    user = User(email=email, password_hash=generate_password_hash(password), name=name)
    db.add(user)
    db.commit()

    token = create_token(user.id)
    return AuthResponse(token=token, user=UserOut(id=user.id, email=user.email, name=user.name))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, body.password):
        raise HTTPException(status_code=401, detail="invalid email or password")

    token = create_token(user.id)
    return AuthResponse(token=token, user=UserOut(id=user.id, email=user.email, name=user.name))

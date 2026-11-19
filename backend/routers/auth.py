"""Authentication router: register, login, portal validation."""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User, UserRole
from auth_utils import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    portal: str  # "customer" or "admin"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new customer account."""
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})

    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "role": user.role.value},
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email/password and portal validation."""
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if request.portal == "admin" and user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin portal access denied. This account is not an admin.")
    if request.portal == "customer" and user.role != UserRole.customer:
        raise HTTPException(status_code=403, detail="Customer portal access denied. This account is an admin.")

    token = create_access_token({"sub": user.id, "role": user.role.value})

    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "role": user.role.value},
    )
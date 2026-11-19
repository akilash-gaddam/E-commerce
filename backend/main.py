"""STANDARD.IO FastAPI Backend Application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, SessionLocal
from models import User
from seed import seed_database
from deps import oauth2_scheme, get_current_user
from routers import auth, products, customer, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed the database on startup if it is empty."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_count = db.query(func.count(User.id)).scalar()
        if not user_count:
            seed_database()
    finally:
        db.close()

    yield


app = FastAPI(
    title="STANDARD.IO API",
    description="Modern supermarket e-commerce backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customer.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "STANDARD.IO API", "version": "1.0.0", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/me")
def me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
    }
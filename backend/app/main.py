import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    auth_router,
    donations_router,
    requests_router,
    collections_router,
    notifications_router,
    feedback_reports_router,
    admin_router,
    analytics_router,
)
from app.services.donation_service import refresh_expired_donations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure upload directories exist
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "donations"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "certificates"), exist_ok=True)
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-expire overdue donations on startup
    db = SessionLocal()
    try:
        refresh_expired_donations(db)
    finally:
        db.close()
    
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Food Donation & Redistribution Platform connecting food donors with verified NGOs and volunteers.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth_router)
app.include_router(donations_router)
app.include_router(requests_router)
app.include_router(collections_router)
app.include_router(notifications_router)
app.include_router(feedback_reports_router)
app.include_router(admin_router)
app.include_router(analytics_router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


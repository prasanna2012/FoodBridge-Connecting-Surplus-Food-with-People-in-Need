from app.routers.auth import router as auth_router
from app.routers.donations import router as donations_router
from app.routers.requests import router as requests_router
from app.routers.collections import router as collections_router
from app.routers.notifications import router as notifications_router
from app.routers.feedback_reports import router as feedback_reports_router
from app.routers.admin import router as admin_router
from app.routers.analytics import router as analytics_router

__all__ = [
    "auth_router",
    "donations_router",
    "requests_router",
    "collections_router",
    "notifications_router",
    "feedback_reports_router",
    "admin_router",
    "analytics_router",
]


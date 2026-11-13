from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.analytics import (
    PlatformOverviewStats,
    CategoryDistribution,
    MonthlyTrend,
    DonorAnalytics,
    NgoAnalytics,
)
from app.services.auth_service import get_current_user, require_role
from app.services.analytics_service import (
    get_platform_overview_stats,
    get_category_distribution,
    get_monthly_trends,
    get_donor_analytics,
    get_ngo_analytics,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Impact"])

@router.get("/overview", response_model=PlatformOverviewStats)
def get_overview(db: Session = Depends(get_db)):
    return get_platform_overview_stats(db)

@router.get("/categories", response_model=List[CategoryDistribution])
def get_categories(db: Session = Depends(get_db)):
    return get_category_distribution(db)

@router.get("/trends", response_model=List[MonthlyTrend])
def get_trends(db: Session = Depends(get_db)):
    return get_monthly_trends(db)

@router.get("/donor", response_model=DonorAnalytics)
def get_donor_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.donor, UserRole.admin))
):
    return get_donor_analytics(db, current_user.id)

@router.get("/ngo", response_model=NgoAnalytics)
def get_ngo_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ngo, UserRole.admin))
):
    return get_ngo_analytics(db, current_user.id)


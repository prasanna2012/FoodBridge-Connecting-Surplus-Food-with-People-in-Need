from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.donation import FoodDonation, DonationStatus
from app.models.interaction import Feedback, Report, ReportStatus, NotificationType
from app.schemas.interaction import (
    FeedbackCreate,
    FeedbackResponse,
    ReportCreate,
    ReportResponse,
)
from app.services.auth_service import get_current_user
from app.services.notification_service import send_notification

router = APIRouter(prefix="/api", tags=["Feedback & Reports"])

@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    fb_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == fb_in.donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status != DonationStatus.completed:
        raise HTTPException(status_code=400, detail="Feedback can only be submitted for completed donations.")

    # Check recipient exists
    recipient = db.query(User).filter(User.id == fb_in.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found")

    fb = Feedback(
        donation_id=fb_in.donation_id,
        reviewer_id=current_user.id,
        recipient_id=fb_in.recipient_id,
        rating=fb_in.rating,
        comment=fb_in.comment
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    # Notify recipient
    send_notification(
        db=db,
        user_id=fb_in.recipient_id,
        title="New Feedback Received",
        message=f"{current_user.full_name} gave you a {fb_in.rating}-star review for donation '{donation.title}'.",
        notification_type=NotificationType.system,
        related_donation_id=donation.id
    )

    return fb

@router.get("/feedback/donation/{donation_id}", response_model=List[FeedbackResponse])
def get_donation_feedback(donation_id: int, db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.donation_id == donation_id).all()

@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    rep_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = Report(
        reporter_id=current_user.id,
        donation_id=rep_in.donation_id,
        reported_user_id=rep_in.reported_user_id,
        reason=rep_in.reason,
        details=rep_in.details,
        status=ReportStatus.open
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Notify administrators
    admins = db.query(User).filter(User.role == UserRole.admin).all()
    for admin in admins:
        send_notification(
            db=db,
            user_id=admin.id,
            title="Safety/Conduct Report Submitted",
            message=f"A new report was flagged by {current_user.full_name}: '{rep_in.reason}'.",
            notification_type=NotificationType.system,
            related_donation_id=rep_in.donation_id
        )

    return report

@router.get("/reports/my", response_model=List[ReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Report).filter(Report.reporter_id == current_user.id).all()


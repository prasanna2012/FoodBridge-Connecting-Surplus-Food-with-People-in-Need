from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, NGOProfile, UserRole, VerificationStatus
from app.models.donation import FoodDonation, DonationRequest, DonationStatus
from app.models.interaction import Report, ReportStatus, NotificationType
from app.schemas.user import UserResponse, NGOVerificationUpdate
from app.schemas.donation import FoodDonationResponse, DonationRequestResponse
from app.schemas.interaction import ReportResponse, ReportResolution
from app.services.auth_service import require_role
from app.services.notification_service import send_notification

router = APIRouter(prefix="/api/admin", tags=["Admin Management"], dependencies=[Depends(require_role(UserRole.admin))])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[UserRole] = None,
    verified: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if verified is not None:
        query = query.filter(User.is_verified == verified)
    return query.order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/toggle-status")
def toggle_user_active_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User status set to {'Active' if user.is_active else 'Deactivated'}"}

@router.put("/ngos/{ngo_user_id}/verify")
def verify_ngo_account(
    ngo_user_id: int,
    verif_in: NGOVerificationUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.admin))
):
    user = db.query(User).filter(User.id == ngo_user_id, User.role == UserRole.ngo).first()
    if not user:
        raise HTTPException(status_code=404, detail="NGO user account not found")

    ngo_profile = db.query(NGOProfile).filter(NGOProfile.user_id == ngo_user_id).first()
    if not ngo_profile:
        raise HTTPException(status_code=404, detail="NGO profile not found")

    ngo_profile.verification_status = verif_in.verification_status
    now = datetime.utcnow()

    if verif_in.verification_status == VerificationStatus.verified:
        user.is_verified = True
        ngo_profile.verified_at = now
        ngo_profile.verified_by = admin_user.id
        ngo_profile.rejection_reason = None

        send_notification(
            db=db,
            user_id=user.id,
            title="NGO Account Verified! 🎉",
            message=f"Congratulations! Your organization '{ngo_profile.organization_name}' has been verified by the FoodBridge Admin team. You can now request food donations.",
            notification_type=NotificationType.account_verified
        )
    elif verif_in.verification_status == VerificationStatus.rejected:
        user.is_verified = False
        ngo_profile.rejection_reason = verif_in.rejection_reason

        send_notification(
            db=db,
            user_id=user.id,
            title="NGO Verification Update",
            message=f"Verification for '{ngo_profile.organization_name}' could not be approved. Reason: {verif_in.rejection_reason}",
            notification_type=NotificationType.system
        )

    db.commit()
    db.refresh(ngo_profile)
    return {"message": f"NGO status updated to {verif_in.verification_status.value}", "profile": ngo_profile.id}

@router.get("/donations", response_model=List[FoodDonationResponse])
def get_all_donations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(FoodDonation)
    if status_filter:
        query = query.filter(FoodDonation.status == status_filter)
    return query.order_by(FoodDonation.created_at.desc()).all()

@router.delete("/donations/{donation_id}")
def admin_delete_donation(
    donation_id: int,
    reason: Optional[str] = Query("Violation of platform food safety guidelines"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.admin))
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Notify donor
    send_notification(
        db=db,
        user_id=donation.donor_id,
        title="Donation Listing Removed",
        message=f"Your listing '{donation.title}' was removed by an administrator. Reason: {reason}",
        notification_type=NotificationType.system
    )

    db.delete(donation)
    db.commit()
    return {"message": "Donation listing removed successfully"}

@router.get("/requests", response_model=List[DonationRequestResponse])
def get_all_requests(db: Session = Depends(get_db)):
    return db.query(DonationRequest).order_by(DonationRequest.created_at.desc()).all()

@router.get("/reports", response_model=List[ReportResponse])
def get_all_reports(
    status_filter: Optional[ReportStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    return query.order_by(Report.created_at.desc()).all()

@router.put("/reports/{report_id}/resolve")
def resolve_report(
    report_id: int,
    res_in: ReportResolution,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.admin))
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = res_in.status
    report.admin_resolution_notes = res_in.admin_resolution_notes
    report.resolved_by = admin_user.id
    report.resolved_at = datetime.utcnow()

    db.commit()

    # Notify reporter
    send_notification(
        db=db,
        user_id=report.reporter_id,
        title="Report Updated",
        message=f"Your report regarding '{report.reason}' has been marked as {res_in.status.value}. Notes: {res_in.admin_resolution_notes}",
        notification_type=NotificationType.system
    )

    return {"message": f"Report updated to {res_in.status.value}"}


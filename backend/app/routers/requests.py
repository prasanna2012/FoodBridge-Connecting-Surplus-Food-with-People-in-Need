from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole, VerificationStatus
from app.models.donation import (
    FoodDonation,
    DonationRequest,
    DonationStatus,
    RequestStatus,
)
from app.models.interaction import NotificationType
from app.schemas.donation import (
    DonationRequestCreate,
    DonationRequestResponse,
    DonationRequestDecision,
    DonationCollectionResponse,
)
from app.services.auth_service import get_current_user, require_role
from app.services.donation_service import accept_donation_request
from app.services.notification_service import send_notification

router = APIRouter(prefix="/api", tags=["Donation Requests"])

@router.post("/donations/{donation_id}/request", response_model=DonationRequestResponse, status_code=status.HTTP_201_CREATED)
def request_donation(
    donation_id: int,
    req_in: DonationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ngo, UserRole.admin))
):
    # Verify NGO account
    if current_user.role == UserRole.ngo and not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your NGO account is pending administrative verification. You can browse listings, but verification is required before claiming donations."
        )

    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status not in [DonationStatus.available, DonationStatus.requested]:
        raise HTTPException(
            status_code=400,
            detail=f"This donation is currently '{donation.status.value}' and cannot accept new requests."
        )

    # Check if NGO already requested
    existing = db.query(DonationRequest).filter(
        DonationRequest.donation_id == donation_id,
        DonationRequest.ngo_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a request for this donation.")

    req = DonationRequest(
        donation_id=donation_id,
        ngo_id=current_user.id,
        message=req_in.message,
        estimated_pickup_time=req_in.estimated_pickup_time,
        status=RequestStatus.pending
    )
    db.add(req)

    # Update donation status to 'requested' if it was 'available'
    if donation.status == DonationStatus.available:
        donation.status = DonationStatus.requested

    db.commit()
    db.refresh(req)

    # Notify donor
    send_notification(
        db=db,
        user_id=donation.donor_id,
        title="New Donation Request!",
        message=f"{current_user.full_name} has requested your donation '{donation.title}'. Please review and accept to coordinate pickup.",
        notification_type=NotificationType.request_received,
        related_donation_id=donation.id
    )

    return req

@router.get("/requests/my", response_model=List[DonationRequestResponse])
def get_my_ngo_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ngo, UserRole.admin))
):
    return db.query(DonationRequest).filter(
        DonationRequest.ngo_id == current_user.id
    ).order_by(DonationRequest.created_at.desc()).all()

@router.get("/donations/{donation_id}/requests", response_model=List[DonationRequestResponse])
def get_donation_requests_for_donor(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    return db.query(DonationRequest).filter(
        DonationRequest.donation_id == donation_id
    ).all()

@router.post("/requests/{request_id}/decision")
def decide_request(
    request_id: int,
    decision_in: DonationRequestDecision,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.donor, UserRole.admin))
):
    req = db.query(DonationRequest).filter(DonationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    donation = db.query(FoodDonation).filter(FoodDonation.id == req.donation_id).first()
    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    if decision_in.decision == "accepted":
        collection = accept_donation_request(
            db=db,
            donor_id=donation.donor_id,
            request_id=request_id,
            decision_notes=decision_in.decision_notes
        )
        return {
            "message": "Request accepted successfully",
            "donation_status": donation.status.value,
            "verification_code": collection.verification_code
        }
    elif decision_in.decision == "rejected":
        req.status = RequestStatus.rejected
        req.decision_notes = decision_in.decision_notes
        req.responded_at = datetime.utcnow()
        
        # Check if there are other pending requests; if not, return donation to available
        remaining_pending = db.query(DonationRequest).filter(
            DonationRequest.donation_id == donation.id,
            DonationRequest.id != req.id,
            DonationRequest.status == RequestStatus.pending
        ).count()
        if remaining_pending == 0:
            donation.status = DonationStatus.available

        db.commit()

        send_notification(
            db=db,
            user_id=req.ngo_id,
            title="Request Declined",
            message=f"The donor was unable to accept your request for '{donation.title}'.",
            notification_type=NotificationType.request_rejected,
            related_donation_id=donation.id
        )

        return {"message": "Request rejected", "donation_status": donation.status.value}
    else:
        raise HTTPException(status_code=400, detail="Decision must be either 'accepted' or 'rejected'")


import secrets
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.donation import (
    FoodDonation,
    DonationRequest,
    DonationCollection,
    DonationStatus,
    RequestStatus,
)
from app.models.interaction import NotificationType
from app.services.notification_service import send_notification

def generate_verification_otp() -> str:
    """Generate a secure 6-digit verification code for collection handoff"""
    return f"{secrets.randbelow(900000) + 100000}"

def refresh_expired_donations(db: Session):
    """
    Check for any available or requested donations past their expiry deadline
    and transition them to 'expired'.
    """
    now = datetime.utcnow()
    expired_donations = db.query(FoodDonation).filter(
        FoodDonation.expiry_deadline <= now,
        FoodDonation.status.in_([DonationStatus.available, DonationStatus.requested])
    ).all()

    for don in expired_donations:
        don.status = DonationStatus.expired
        # Notify donor
        send_notification(
            db=db,
            user_id=don.donor_id,
            title="Donation Expired",
            message=f"Your donation '{don.title}' has reached its expiry deadline ({don.expiry_deadline.strftime('%Y-%m-%d %H:%M')}) and is now closed.",
            notification_type=NotificationType.expiry_alert,
            related_donation_id=don.id
        )
        # Cancel any pending requests
        for req in don.requests:
            if req.status == RequestStatus.pending:
                req.status = RequestStatus.rejected
                req.decision_notes = "Donation expired before fulfillment."
                send_notification(
                    db=db,
                    user_id=req.ngo_id,
                    title="Donation Expired",
                    message=f"The donation '{don.title}' you requested reached its expiry deadline and was closed.",
                    notification_type=NotificationType.expiry_alert,
                    related_donation_id=don.id
                )
    if expired_donations:
        db.commit()

def accept_donation_request(
    db: Session,
    donor_id: int,
    request_id: int,
    decision_notes: str = None
) -> DonationCollection:
    """
    Safely accept a request with pessimistic locking (SELECT ... FOR UPDATE)
    to prevent race conditions / duplicate acceptance.
    """
    # 1. Lock the request
    req = db.query(DonationRequest).filter(DonationRequest.id == request_id).with_for_update().first()
    if not req:
        raise HTTPException(status_code=404, detail="Donation request not found")

    # 2. Lock the donation
    donation = db.query(FoodDonation).filter(FoodDonation.id == req.donation_id).with_for_update().first()
    if not donation:
        raise HTTPException(status_code=404, detail="Associated donation not found")

    if donation.donor_id != donor_id:
        raise HTTPException(status_code=403, detail="You can only manage requests for your own donations")

    if donation.status not in [DonationStatus.available, DonationStatus.requested]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept request. Donation is already in '{donation.status.value}' status."
        )

    if req.status != RequestStatus.pending:
        raise HTTPException(status_code=400, detail="This request has already been processed.")

    # 3. Accept this request
    now = datetime.utcnow()
    req.status = RequestStatus.accepted
    req.responded_at = now
    req.decision_notes = decision_notes

    # 4. Reject other pending requests for the same donation
    other_requests = db.query(DonationRequest).filter(
        DonationRequest.donation_id == donation.id,
        DonationRequest.id != req.id,
        DonationRequest.status == RequestStatus.pending
    ).all()

    for other_req in other_requests:
        other_req.status = RequestStatus.rejected
        other_req.responded_at = now
        other_req.decision_notes = "Another NGO was accepted for this donation."
        send_notification(
            db=db,
            user_id=other_req.ngo_id,
            title="Donation Request Not Selected",
            message=f"The donor accepted another organization's request for '{donation.title}'. Thank you for your willingness to help!",
            notification_type=NotificationType.request_rejected,
            related_donation_id=donation.id
        )

    # 5. Update donation status to accepted
    donation.status = DonationStatus.accepted

    # 6. Generate secure 6-digit handoff OTP and create collection record
    otp_code = generate_verification_otp()
    collection = DonationCollection(
        donation_id=donation.id,
        request_id=req.id,
        ngo_id=req.ngo_id,
        donor_id=donor_id,
        verification_code=otp_code,
        donor_confirmed=False,
        ngo_confirmed=False
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)

    # 7. Send notifications to NGO and Donor
    send_notification(
        db=db,
        user_id=req.ngo_id,
        title="Donation Request Accepted!",
        message=f"Your request for '{donation.title}' was accepted! Pickup Code: {otp_code}. Coordinate pickup at {donation.pickup_address}.",
        notification_type=NotificationType.request_accepted,
        related_donation_id=donation.id
    )

    send_notification(
        db=db,
        user_id=donor_id,
        title="Request Accepted",
        message=f"You accepted the request from NGO for '{donation.title}'. Handover OTP is {otp_code}.",
        notification_type=NotificationType.request_accepted,
        related_donation_id=donation.id
    )

    return collection


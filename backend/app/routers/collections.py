from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.donation import (
    FoodDonation,
    DonationCollection,
    DonationStatus,
)
from app.models.interaction import NotificationType
from app.schemas.donation import (
    DonationCollectionResponse,
    CollectionVerificationRequest,
)
from app.services.auth_service import get_current_user
from app.services.notification_service import send_notification

router = APIRouter(prefix="/api/collections", tags=["Collection & Handoff"])

@router.get("/{donation_id}", response_model=DonationCollectionResponse)
def get_collection_details(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    collection = db.query(DonationCollection).filter(
        DonationCollection.donation_id == donation_id
    ).first()
    if not collection:
        raise HTTPException(status_code=404, detail="No active collection record found for this donation.")

    # Only donor, claimed NGO, or admin can view
    if current_user.id not in [collection.donor_id, collection.ngo_id] and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    return collection

@router.post("/{donation_id}/ready")
def mark_ready_for_pickup(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    if donation.status != DonationStatus.accepted:
        raise HTTPException(
            status_code=400,
            detail=f"Donation must be in 'accepted' status before marking ready. Current: {donation.status.value}"
        )

    donation.status = DonationStatus.ready_for_pickup
    db.commit()

    collection = db.query(DonationCollection).filter(DonationCollection.donation_id == donation_id).first()
    if collection:
        send_notification(
            db=db,
            user_id=collection.ngo_id,
            title="Food Ready For Pickup!",
            message=f"The donor has prepared and packed '{donation.title}'. You can now proceed to pickup at {donation.pickup_address}.",
            notification_type=NotificationType.ready_for_pickup,
            related_donation_id=donation.id
        )

    return {"message": "Donation marked ready for pickup", "status": donation.status.value}

@router.post("/{donation_id}/verify-handoff")
def verify_and_complete_collection(
    donation_id: int,
    handoff_in: CollectionVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    collection = db.query(DonationCollection).filter(DonationCollection.donation_id == donation_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection record not found")

    if current_user.id not in [collection.donor_id, collection.ngo_id] and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Verify 6-digit OTP
    if handoff_in.verification_code.strip() != collection.verification_code:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check the 6-digit OTP code.")

    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    now = datetime.utcnow()

    # Update collection record
    collection.donor_confirmed = True
    collection.ngo_confirmed = True
    collection.donor_confirmed_at = now
    collection.ngo_confirmed_at = now
    collection.collected_at = now
    collection.completed_at = now
    if handoff_in.notes:
        collection.collection_notes = handoff_in.notes
    if handoff_in.temperature_check_celsius is not None:
        collection.temperature_check_celsius = handoff_in.temperature_check_celsius
    if handoff_in.transport_method:
        collection.transport_method = handoff_in.transport_method

    # Transition donation status: collected -> completed
    donation.status = DonationStatus.completed

    db.commit()
    db.refresh(collection)

    # Send celebration notifications to both donor and NGO
    send_notification(
        db=db,
        user_id=collection.donor_id,
        title="Donation Completed! 🎉",
        message=f"Collection for '{donation.title}' was confirmed! Thank you for reducing food waste and feeding the community.",
        notification_type=NotificationType.completed,
        related_donation_id=donation.id
    )

    send_notification(
        db=db,
        user_id=collection.ngo_id,
        title="Donation Collected! 🎉",
        message=f"Pickup for '{donation.title}' verified successfully. Please redistribute promptly.",
        notification_type=NotificationType.completed,
        related_donation_id=donation.id
    )

    return {
        "message": "Donation collection verified and completed successfully!",
        "status": donation.status.value,
        "completed_at": collection.completed_at
    }


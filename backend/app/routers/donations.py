import math
import os
import shutil
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User, UserRole
from app.models.donation import (
    FoodDonation,
    DonationStatus,
    FoodCategory,
    QuantityUnit,
    StorageCondition,
    DonationRequest,
    RequestStatus,
)
from app.models.interaction import NotificationType
from app.schemas.donation import (
    FoodDonationCreate,
    FoodDonationResponse,
    FoodDonationUpdate,
    DonationCancelRequest,
)
from app.services.auth_service import get_current_user, require_role
from app.services.donation_service import refresh_expired_donations
from app.services.notification_service import send_notification
from app.config import settings

router = APIRouter(prefix="/api/donations", tags=["Food Donations"])

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("", response_model=FoodDonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: FoodDonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.donor, UserRole.admin))
):
    # Safety & validation checks
    now = datetime.utcnow()
    # Strip timezone info if present to compare with naive UTC
    expiry_naive = donation_in.expiry_deadline.replace(tzinfo=None)
    if expiry_naive <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry / use-by deadline must be a future time."
        )

    if donation_in.preparation_time:
        prep_naive = donation_in.preparation_time.replace(tzinfo=None)
        if prep_naive > expiry_naive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Preparation time cannot be after the expiry deadline."
            )

    donation = FoodDonation(
        donor_id=current_user.id,
        title=donation_in.title,
        description=donation_in.description,
        food_category=donation_in.food_category,
        quantity_value=donation_in.quantity_value,
        quantity_unit=donation_in.quantity_unit,
        preparation_time=donation_in.preparation_time,
        expiry_deadline=donation_in.expiry_deadline,
        pickup_address=donation_in.pickup_address,
        pickup_instructions=donation_in.pickup_instructions,
        latitude=donation_in.latitude,
        longitude=donation_in.longitude,
        storage_condition=donation_in.storage_condition,
        allergens=donation_in.allergens or "None",
        safety_declaration_accepted=donation_in.safety_declaration_accepted,
        status=DonationStatus.available,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    # Send confirmation notification to donor
    send_notification(
        db=db,
        user_id=current_user.id,
        title="Donation Published",
        message=f"Your donation '{donation.title}' is now visible to nearby verified NGOs.",
        notification_type=NotificationType.system,
        related_donation_id=donation.id
    )

    return donation

@router.get("", response_model=List[FoodDonationResponse])
def list_donations(
    category: Optional[FoodCategory] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = Query(50.0, description="Max radius in km"),
    storage: Optional[StorageCondition] = None,
    db: Session = Depends(get_db)
):
    # Auto-refresh expired listings
    refresh_expired_donations(db)

    query = db.query(FoodDonation)

    if status_filter:
        query = query.filter(FoodDonation.status == status_filter)
    else:
        # Default to available listings
        query = query.filter(FoodDonation.status == DonationStatus.available)

    if category:
        query = query.filter(FoodDonation.food_category == category)

    if storage:
        query = query.filter(FoodDonation.storage_condition == storage)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                FoodDonation.title.ilike(s),
                FoodDonation.description.ilike(s),
                FoodDonation.pickup_address.ilike(s)
            )
        )

    donations = query.order_by(FoodDonation.expiry_deadline.asc()).all()

    # Apply distance filter if coordinates provided
    if lat is not None and lng is not None:
        filtered = []
        for d in donations:
            dist = haversine_distance_km(lat, lng, float(d.latitude), float(d.longitude))
            if dist <= radius_km:
                filtered.append(d)
        return filtered

    return donations

@router.get("/my/donor", response_model=List[FoodDonationResponse])
def get_my_donor_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.donor, UserRole.admin))
):
    refresh_expired_donations(db)
    return db.query(FoodDonation).filter(
        FoodDonation.donor_id == current_user.id
    ).order_by(FoodDonation.created_at.desc()).all()

@router.get("/{donation_id}", response_model=FoodDonationResponse)
def get_donation_by_id(donation_id: int, db: Session = Depends(get_db)):
    refresh_expired_donations(db)
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation listing not found")
    return donation

@router.put("/{donation_id}", response_model=FoodDonationResponse)
def update_donation(
    donation_id: int,
    donation_update: FoodDonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation listing not found")
    
    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this listing.")

    if donation.status not in [DonationStatus.available, DonationStatus.requested]:
        raise HTTPException(status_code=400, detail="Cannot edit a donation that has already been accepted or completed.")

    update_data = donation_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(donation, field, val)

    db.commit()
    db.refresh(donation)
    return donation

@router.post("/{donation_id}/cancel", response_model=FoodDonationResponse)
def cancel_donation(
    donation_id: int,
    cancel_in: DonationCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Food donation listing not found")

    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="You do not have permission to cancel this donation.")

    if donation.status in [DonationStatus.collected, DonationStatus.completed]:
        raise HTTPException(status_code=400, detail="Cannot cancel a donation that has already been collected.")

    donation.status = DonationStatus.cancelled
    donation.cancellation_reason = cancel_in.reason

    # Cancel pending requests and notify NGOs
    for req in donation.requests:
        if req.status in [RequestStatus.pending, RequestStatus.accepted]:
            req.status = RequestStatus.cancelled
            req.decision_notes = f"Donation cancelled by donor: {cancel_in.reason}"
            send_notification(
                db=db,
                user_id=req.ngo_id,
                title="Donation Cancelled",
                message=f"The listing for '{donation.title}' was cancelled by the donor ({cancel_in.reason}).",
                notification_type=NotificationType.system,
                related_donation_id=donation.id
            )

    db.commit()
    db.refresh(donation)
    return donation

@router.post("/{donation_id}/upload-image")
def upload_donation_image(
    donation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(FoodDonation).filter(FoodDonation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.donor_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Permission denied")

    os.makedirs(os.path.join(settings.UPLOAD_DIR, "donations"), exist_ok=True)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid image file format. Allowed: JPG, PNG, WEBP, GIF.")

    filename = f"donation_{donation_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "donations", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    donation.image_url = f"/uploads/donations/{filename}"
    db.commit()
    db.refresh(donation)

    return {"image_url": donation.image_url, "message": "Image uploaded successfully"}


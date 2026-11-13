from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.donation import (
    FoodCategory,
    QuantityUnit,
    StorageCondition,
    DonationStatus,
    RequestStatus,
)
from app.schemas.user import UserResponse

class FoodDonationBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    food_category: FoodCategory
    quantity_value: float = Field(..., gt=0)
    quantity_unit: QuantityUnit
    preparation_time: Optional[datetime] = None
    expiry_deadline: datetime
    pickup_address: str = Field(..., min_length=5)
    pickup_instructions: Optional[str] = None
    latitude: float
    longitude: float
    storage_condition: StorageCondition = StorageCondition.ambient
    allergens: Optional[str] = None # e.g. "Dairy, Nuts" or "None"
    safety_declaration_accepted: bool = False

    @field_validator("safety_declaration_accepted")
    def validate_safety(cls, v):
        if not v:
            raise ValueError("Donor must explicitly agree to the food safety and accurate details declaration")
        return v

class FoodDonationCreate(FoodDonationBase):
    pass

class FoodDonationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    food_category: Optional[FoodCategory] = None
    quantity_value: Optional[float] = None
    quantity_unit: Optional[QuantityUnit] = None
    expiry_deadline: Optional[datetime] = None
    pickup_address: Optional[str] = None
    pickup_instructions: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    storage_condition: Optional[StorageCondition] = None
    allergens: Optional[str] = None
    image_url: Optional[str] = None

class DonationRequestBase(BaseModel):
    message: Optional[str] = None
    estimated_pickup_time: Optional[datetime] = None

class DonationRequestCreate(DonationRequestBase):
    pass

class DonationRequestResponse(DonationRequestBase):
    id: int
    donation_id: int
    ngo_id: int
    status: RequestStatus
    decision_notes: Optional[str] = None
    requested_at: datetime
    responded_at: Optional[datetime] = None
    ngo: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class DonationCollectionResponse(BaseModel):
    id: int
    donation_id: int
    request_id: int
    ngo_id: int
    donor_id: int
    verification_code: str
    donor_confirmed: bool
    ngo_confirmed: bool
    donor_confirmed_at: Optional[datetime] = None
    ngo_confirmed_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    collection_notes: Optional[str] = None
    temperature_check_celsius: Optional[float] = None
    transport_method: Optional[str] = None

    class Config:
        from_attributes = True

class FoodDonationResponse(FoodDonationBase):
    id: int
    donor_id: int
    image_url: Optional[str] = None
    status: DonationStatus
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    donor: Optional[UserResponse] = None
    requests: Optional[List[DonationRequestResponse]] = None
    collection: Optional[DonationCollectionResponse] = None

    class Config:
        from_attributes = True

class DonationRequestDecision(BaseModel):
    decision: str # "accepted" or "rejected"
    decision_notes: Optional[str] = None

class CollectionVerificationRequest(BaseModel):
    verification_code: str
    temperature_check_celsius: Optional[float] = None
    transport_method: Optional[str] = None
    notes: Optional[str] = None

class DonationCancelRequest(BaseModel):
    reason: str


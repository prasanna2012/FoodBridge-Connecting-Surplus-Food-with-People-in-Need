import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class FoodCategory(str, enum.Enum):
    cooked_meals = "cooked_meals"
    bakery = "bakery"
    produce_fruits_vegetables = "produce_fruits_vegetables"
    dairy = "dairy"
    packaged_groceries = "packaged_groceries"
    beverages = "beverages"
    catered_buffet = "catered_buffet"
    other = "other"

class QuantityUnit(str, enum.Enum):
    kg = "kg"
    servings = "servings"
    boxes = "boxes"
    packets = "packets"
    liters = "liters"

class StorageCondition(str, enum.Enum):
    ambient = "ambient"
    refrigerated = "refrigerated"
    frozen = "frozen"
    hot_holding = "hot_holding"

class DonationStatus(str, enum.Enum):
    available = "available"
    requested = "requested"
    accepted = "accepted"
    ready_for_pickup = "ready_for_pickup"
    collected = "collected"
    completed = "completed"
    rejected = "rejected"
    expired = "expired"
    cancelled = "cancelled"

class RequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"

class FoodDonation(Base):
    __tablename__ = "food_donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    food_category = Column(Enum(FoodCategory), nullable=False, index=True)
    quantity_value = Column(Numeric(10, 2), nullable=False)
    quantity_unit = Column(Enum(QuantityUnit), nullable=False)
    preparation_time = Column(DateTime, nullable=True)
    expiry_deadline = Column(DateTime, nullable=False, index=True)
    pickup_address = Column(String(255), nullable=False)
    pickup_instructions = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 7), nullable=False)
    longitude = Column(Numeric(10, 7), nullable=False)
    storage_condition = Column(Enum(StorageCondition), nullable=False, default=StorageCondition.ambient)
    allergens = Column(String(255), nullable=True) # comma separated: "Nuts, Dairy, Gluten"
    safety_declaration_accepted = Column(Boolean, nullable=False, default=False)
    image_url = Column(String(255), nullable=True)
    status = Column(Enum(DonationStatus), nullable=False, default=DonationStatus.available, index=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("User", back_populates="donations")
    requests = relationship("DonationRequest", back_populates="donation", cascade="all, delete-orphan")
    collection = relationship("DonationCollection", back_populates="donation", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="donation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="donation")

class DonationRequest(Base):
    __tablename__ = "donation_requests"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("food_donations.id", ondelete="CASCADE"), nullable=False, index=True)
    ngo_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.pending, index=True)
    estimated_pickup_time = Column(DateTime, nullable=True)
    decision_notes = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donation = relationship("FoodDonation", back_populates="requests")
    ngo = relationship("User", back_populates="requests")
    collection = relationship("DonationCollection", back_populates="request", uselist=False)

class DonationCollection(Base):
    __tablename__ = "donation_collections"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("food_donations.id", ondelete="CASCADE"), unique=True, nullable=False)
    request_id = Column(Integer, ForeignKey("donation_requests.id", ondelete="CASCADE"), unique=True, nullable=False)
    ngo_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    verification_code = Column(String(10), nullable=False) # 6 digit OTP
    donor_confirmed = Column(Boolean, default=False)
    ngo_confirmed = Column(Boolean, default=False)
    donor_confirmed_at = Column(DateTime, nullable=True)
    ngo_confirmed_at = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    collection_notes = Column(Text, nullable=True)
    temperature_check_celsius = Column(Numeric(5, 2), nullable=True)
    transport_method = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donation = relationship("FoodDonation", back_populates="collection")
    request = relationship("DonationRequest", back_populates="collection")
    ngo = relationship("User", foreign_keys=[ngo_id])
    donor = relationship("User", foreign_keys=[donor_id])


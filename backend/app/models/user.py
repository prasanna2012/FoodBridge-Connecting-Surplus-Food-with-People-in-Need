import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    donor = "donor"
    ngo = "ngo"
    admin = "admin"

class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ngo_profile = relationship("NGOProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="NGOProfile.user_id")
    donations = relationship("FoodDonation", back_populates="donor", cascade="all, delete-orphan")
    requests = relationship("DonationRequest", back_populates="ngo", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports_submitted = relationship("Report", back_populates="reporter", foreign_keys="Report.reporter_id")

class NGOProfile(Base):
    __tablename__ = "ngo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization_name = Column(String(200), nullable=False)
    registration_number = Column(String(100), nullable=False)
    certificate_url = Column(String(255), nullable=True)
    mission_statement = Column(Text, nullable=True)
    contact_person = Column(String(100), nullable=True)
    operating_areas = Column(String(255), nullable=True)
    capacity_meals_per_day = Column(Integer, default=100)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.pending, index=True)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ngo_profile", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])


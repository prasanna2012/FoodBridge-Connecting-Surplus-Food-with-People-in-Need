from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, VerificationStatus

class NGOProfileBase(BaseModel):
    organization_name: str
    registration_number: str
    mission_statement: Optional[str] = None
    contact_person: Optional[str] = None
    operating_areas: Optional[str] = None
    capacity_meals_per_day: Optional[int] = 100

class NGOProfileCreate(NGOProfileBase):
    pass

class NGOProfileResponse(NGOProfileBase):
    id: int
    user_id: int
    certificate_url: Optional[str] = None
    verification_status: VerificationStatus
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    # NGO-specific registration fields
    ngo_profile: Optional[NGOProfileCreate] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    ngo_profile: Optional[NGOProfileResponse] = None

    class Config:
        from_attributes = True

class NGOVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    rejection_reason: Optional[str] = None


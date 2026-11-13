from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.interaction import NotificationType, ReportStatus
from app.schemas.user import UserResponse

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    related_donation_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    donation_id: int
    recipient_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    donation_id: int
    reviewer_id: int
    recipient_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    donation_id: Optional[int] = None
    reported_user_id: Optional[int] = None
    reason: str = Field(..., min_length=3, max_length=255)
    details: str = Field(..., min_length=10)

class ReportResolution(BaseModel):
    status: ReportStatus # "resolved" or "dismissed" or "investigating"
    admin_resolution_notes: str

class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    donation_id: Optional[int] = None
    reported_user_id: Optional[int] = None
    reason: str
    details: str
    status: ReportStatus
    admin_resolution_notes: Optional[str] = None
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    reporter: Optional[UserResponse] = None

    class Config:
        from_attributes = True


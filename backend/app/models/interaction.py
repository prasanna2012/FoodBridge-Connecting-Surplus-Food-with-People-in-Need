import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class NotificationType(str, enum.Enum):
    request_received = "request_received"
    request_accepted = "request_accepted"
    request_rejected = "request_rejected"
    ready_for_pickup = "ready_for_pickup"
    collected = "collected"
    completed = "completed"
    expiry_alert = "expiry_alert"
    account_verified = "account_verified"
    system = "system"

class ReportStatus(str, enum.Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"
    dismissed = "dismissed"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    related_donation_id = Column(Integer, ForeignKey("food_donations.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
    donation = relationship("FoodDonation")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("food_donations.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 - 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    donation = relationship("FoodDonation", back_populates="feedbacks")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    donation_id = Column(Integer, ForeignKey("food_donations.id", ondelete="SET NULL"), nullable=True)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.open, index=True)
    admin_resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reporter = relationship("User", back_populates="reports_submitted", foreign_keys=[reporter_id])
    donation = relationship("FoodDonation", back_populates="reports")
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


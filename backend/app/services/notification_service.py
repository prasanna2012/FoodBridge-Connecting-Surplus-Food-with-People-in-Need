from sqlalchemy.orm import Session
from app.models.interaction import Notification, NotificationType

def send_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType,
    related_donation_id: int = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_donation_id=related_donation_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


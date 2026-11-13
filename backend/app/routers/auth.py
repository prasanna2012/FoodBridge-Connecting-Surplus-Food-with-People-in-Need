from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, NGOProfile, UserRole, VerificationStatus
from app.models.interaction import NotificationType
from app.schemas.auth import Token, LoginRequest, PasswordChangeRequest
from app.schemas.user import UserRegister, UserResponse, UserUpdate
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.services.notification_service import send_notification
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Donors are auto-verified; NGOs start as pending verification by admin
    is_verified_initial = True if user_in.role == UserRole.donor else False

    user = User(
        email=user_in.email.lower().strip(),
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        address=user_in.address,
        city=user_in.city,
        state=user_in.state,
        postal_code=user_in.postal_code,
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        is_active=True,
        is_verified=is_verified_initial,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If NGO, create NGOProfile
    if user.role == UserRole.ngo:
        ngo_data = user_in.ngo_profile
        profile = NGOProfile(
            user_id=user.id,
            organization_name=ngo_data.organization_name if ngo_data else user.full_name,
            registration_number=ngo_data.registration_number if ngo_data else "PENDING-REG",
            mission_statement=ngo_data.mission_statement if ngo_data else None,
            contact_person=ngo_data.contact_person if ngo_data else user.full_name,
            operating_areas=ngo_data.operating_areas if ngo_data else user.city,
            capacity_meals_per_day=ngo_data.capacity_meals_per_day if (ngo_data and ngo_data.capacity_meals_per_day) else 100,
            verification_status=VerificationStatus.pending
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Notify NGO about pending verification
        send_notification(
            db=db,
            user_id=user.id,
            title="Welcome to FoodBridge!",
            message="Your NGO registration was submitted. An administrator will verify your credentials shortly so you can claim food donations.",
            notification_type=NotificationType.system
        )
    else:
        # Welcome notification for donor
        send_notification(
            db=db,
            user_id=user.id,
            title="Welcome to FoodBridge!",
            message="Thank you for joining our mission to eliminate hunger and reduce food waste. You can now post food donation listings.",
            notification_type=NotificationType.system
        )

    return user

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email.lower().strip()).first()
    if not user or not verify_password(login_req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support."
        )

    # Issue token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.email, "role": user.role.value, "user_id": user.id},
        expires_delta=access_token_expires,
    )
    return Token(
        access_token=token,
        token_type="bearer",
        role=user.role.value,
        user_id=user.id,
        full_name=user.full_name,
        is_verified=user.is_verified,
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    pwd_req: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_req.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    
    current_user.password_hash = hash_password(pwd_req.new_password)
    db.commit()
    return {"message": "Password updated successfully."}


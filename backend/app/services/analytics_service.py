from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.donation import FoodDonation, DonationStatus, QuantityUnit, FoodCategory
from app.models.user import User, UserRole, NGOProfile, VerificationStatus
from app.models.interaction import Report, ReportStatus, Feedback
from app.schemas.analytics import (
    PlatformOverviewStats,
    CategoryDistribution,
    MonthlyTrend,
    DonorAnalytics,
    NgoAnalytics,
)

def convert_to_kg(quantity: float, unit: QuantityUnit) -> float:
    """Helper to normalize quantities to kilograms"""
    if unit == QuantityUnit.kg:
        return float(quantity)
    elif unit == QuantityUnit.servings:
        return float(quantity) * 0.45 # ~450g per serving
    elif unit == QuantityUnit.boxes:
        return float(quantity) * 5.0 # ~5kg per box
    elif unit == QuantityUnit.packets:
        return float(quantity) * 0.5 # ~500g per packet
    elif unit == QuantityUnit.liters:
        return float(quantity) * 1.0 # ~1kg per liter
    return float(quantity)

def get_platform_overview_stats(db: Session) -> PlatformOverviewStats:
    total_donations = db.query(FoodDonation).count()
    active_donations = db.query(FoodDonation).filter(
        FoodDonation.status.in_([
            DonationStatus.available,
            DonationStatus.requested,
            DonationStatus.accepted,
            DonationStatus.ready_for_pickup
        ])
    ).count()
    
    completed_donations_list = db.query(FoodDonation).filter(
        FoodDonation.status.in_([DonationStatus.collected, DonationStatus.completed])
    ).all()
    completed_count = len(completed_donations_list)

    total_kg = sum(convert_to_kg(d.quantity_value, d.quantity_unit) for d in completed_donations_list)
    # Estimate meals: 1 meal = 0.45 kg
    total_meals = int(total_kg / 0.45) if total_kg > 0 else 0
    # 1 kg food diverted ≈ 2.5 kg CO2 equivalent saved
    co2_offset = round(total_kg * 2.5, 2)

    total_donors = db.query(User).filter(User.role == UserRole.donor).count()
    total_ngos = db.query(User).filter(User.role == UserRole.ngo).count()
    pending_ngo = db.query(NGOProfile).filter(NGOProfile.verification_status == VerificationStatus.pending).count()
    open_reports = db.query(Report).filter(Report.status.in_([ReportStatus.open, ReportStatus.investigating])).count()

    return PlatformOverviewStats(
        total_donations=total_donations,
        active_donations=active_donations,
        completed_donations=completed_count,
        total_meals_saved=total_meals,
        total_kg_diverted=round(total_kg, 2),
        estimated_co2_offset_kg=co2_offset,
        total_donors=total_donors,
        total_ngos=total_ngos,
        pending_ngo_verifications=pending_ngo,
        open_reports=open_reports
    )

def get_category_distribution(db: Session) -> list[CategoryDistribution]:
    counts = db.query(
        FoodDonation.food_category,
        func.count(FoodDonation.id)
    ).group_by(FoodDonation.food_category).all()
    
    total = sum(c[1] for c in counts) or 1
    result = []
    for cat, count in counts:
        result.append(CategoryDistribution(
            category=cat.value.replace("_", " ").title(),
            count=count,
            percentage=round((count / total) * 100, 1)
        ))
    return result

def get_monthly_trends(db: Session) -> list[MonthlyTrend]:
    # Group completed donations by month
    completed = db.query(FoodDonation).filter(
        FoodDonation.status.in_([DonationStatus.collected, DonationStatus.completed])
    ).all()

    month_map = {}
    for d in completed:
        m_str = d.created_at.strftime("%b %Y")
        kg = convert_to_kg(d.quantity_value, d.quantity_unit)
        meals = int(kg / 0.45)
        if m_str not in month_map:
            month_map[m_str] = {"count": 0, "meals": 0}
        month_map[m_str]["count"] += 1
        month_map[m_str]["meals"] += meals

    trends = []
    for m, val in month_map.items():
        trends.append(MonthlyTrend(
            month=m,
            donations_count=val["count"],
            meals_saved=val["meals"]
        ))
    if not trends:
        trends = [
            MonthlyTrend(month="Current Month", donations_count=0, meals_saved=0)
        ]
    return trends

def get_donor_analytics(db: Session, donor_id: int) -> DonorAnalytics:
    donations = db.query(FoodDonation).filter(FoodDonation.donor_id == donor_id).all()
    total_listed = len(donations)
    completed = [d for d in donations if d.status in [DonationStatus.collected, DonationStatus.completed]]
    in_progress = [d for d in donations if d.status in [DonationStatus.accepted, DonationStatus.ready_for_pickup, DonationStatus.requested]]

    total_kg = sum(convert_to_kg(d.quantity_value, d.quantity_unit) for d in completed)
    total_meals = int(total_kg / 0.45) if total_kg > 0 else 0
    co2_saved = round(total_kg * 2.5, 2)

    # Feedback rating
    feedbacks = db.query(Feedback).filter(Feedback.recipient_id == donor_id).all()
    positive_rate = 100.0
    if feedbacks:
        positive_count = sum(1 for f in feedbacks if f.rating >= 4)
        positive_rate = round((positive_count / len(feedbacks)) * 100, 1)

    return DonorAnalytics(
        total_listed=total_listed,
        completed=len(completed),
        in_progress=len(in_progress),
        total_kg=round(total_kg, 2),
        total_meals=total_meals,
        estimated_co2_saved_kg=co2_saved,
        positive_feedback_rate=positive_rate
    )

def get_ngo_analytics(db: Session, ngo_id: int) -> NgoAnalytics:
    from app.models.donation import DonationRequest
    requests = db.query(DonationRequest).filter(DonationRequest.ngo_id == ngo_id).all()
    total_requested = len(requests)

    completed_reqs = [r for r in requests if r.donation and r.donation.status in [DonationStatus.collected, DonationStatus.completed]]
    total_collected = len(completed_reqs)
    
    total_kg = sum(convert_to_kg(r.donation.quantity_value, r.donation.quantity_unit) for r in completed_reqs)
    people_served = int(total_kg / 0.45) if total_kg > 0 else 0

    return NgoAnalytics(
        total_requested=total_requested,
        total_collected=total_collected,
        people_served_estimate=people_served,
        total_kg_received=round(total_kg, 2)
    )


import os
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models.user import User, NGOProfile, UserRole, VerificationStatus
from app.models.donation import (
    FoodDonation,
    DonationRequest,
    DonationCollection,
    FoodCategory,
    QuantityUnit,
    StorageCondition,
    DonationStatus,
    RequestStatus,
)
from app.models.interaction import (
    Notification,
    Feedback,
    Report,
    NotificationType,
    ReportStatus,
)
from app.services.auth_service import hash_password
from app.services.donation_service import generate_verification_otp

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@foodbridge.org").first():
            print("Database already contains seed data. Skipping...")
            return

        print("Seeding FoodBridge database with initial demo data...")

        # 1. Admin
        admin = User(
            email="admin@foodbridge.org",
            password_hash=hash_password("admin123"),
            full_name="Platform Administrator",
            role=UserRole.admin,
            phone="+91 98765 00001",
            address="100 Civic Center Boulevard",
            city="Hyderabad",
            state="Telangana",
            postal_code="500001",
            latitude=17.385044,
            longitude=78.486671,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)

        # 2. Donors
        donor1 = User(
            email="grand.hotel@foodbridge.org",
            password_hash=hash_password("donor123"),
            full_name="Grand Horizon Hotel & Banquets",
            role=UserRole.donor,
            phone="+91 98765 11101",
            address="Road No 1, Banjara Hills",
            city="Hyderabad",
            state="Telangana",
            postal_code="500034",
            latitude=17.4156,
            longitude=78.4487,
            is_active=True,
            is_verified=True,
        )
        donor2 = User(
            email="freshmart@foodbridge.org",
            password_hash=hash_password("donor123"),
            full_name="FreshMart Supermarket",
            role=UserRole.donor,
            phone="+91 98765 11102",
            address="Jubilee Hills Check Post",
            city="Hyderabad",
            state="Telangana",
            postal_code="500033",
            latitude=17.4319,
            longitude=78.4073,
            is_active=True,
            is_verified=True,
        )
        donor3 = User(
            email="greenleaf.cafe@foodbridge.org",
            password_hash=hash_password("donor123"),
            full_name="Green Leaf Bistro & Bakery",
            role=UserRole.donor,
            phone="+91 98765 11103",
            address="Madhapur Main Road, Hitech City",
            city="Hyderabad",
            state="Telangana",
            postal_code="500081",
            latitude=17.4483,
            longitude=78.3915,
            is_active=True,
            is_verified=True,
        )
        db.add_all([donor1, donor2, donor3])
        db.flush()

        # 3. NGOs
        ngo1_user = User(
            email="hope.foundation@foodbridge.org",
            password_hash=hash_password("ngo123"),
            full_name="Hope Food Relief Foundation",
            role=UserRole.ngo,
            phone="+91 98765 22201",
            address="Street 4, Begumpet",
            city="Hyderabad",
            state="Telangana",
            postal_code="500016",
            latitude=17.4448,
            longitude=78.4664,
            is_active=True,
            is_verified=True,
        )
        ngo2_user = User(
            email="annapurna.trust@foodbridge.org",
            password_hash=hash_password("ngo123"),
            full_name="Annapurna Hunger Relief Trust",
            role=UserRole.ngo,
            phone="+91 98765 22202",
            address="Near Charminar Old City",
            city="Hyderabad",
            state="Telangana",
            postal_code="500002",
            latitude=17.3616,
            longitude=78.4747,
            is_active=True,
            is_verified=True,
        )
        ngo3_user = User(
            email="care.alliance@foodbridge.org",
            password_hash=hash_password("ngo123"),
            full_name="Care & Share Volunteer Alliance",
            role=UserRole.ngo,
            phone="+91 98765 22203",
            address="Kondapur Colony",
            city="Hyderabad",
            state="Telangana",
            postal_code="500084",
            latitude=17.4699,
            longitude=78.3578,
            is_active=True,
            is_verified=False, # Pending verification for testing
        )
        db.add_all([ngo1_user, ngo2_user, ngo3_user])
        db.flush()

        # NGO Profiles
        ngo_prof1 = NGOProfile(
            user_id=ngo1_user.id,
            organization_name="Hope Food Relief Foundation",
            registration_number="REG-HYD-2018-9412",
            mission_statement="Delivering nutritious hot meals to shelter homes and migrant workers daily.",
            contact_person="Ravi Shankar",
            operating_areas="Banjara Hills, Begumpet, Secunderabad",
            capacity_meals_per_day=350,
            verification_status=VerificationStatus.verified,
            verified_at=datetime.utcnow() - timedelta(days=30),
            verified_by=admin.id
        )
        ngo_prof2 = NGOProfile(
            user_id=ngo2_user.id,
            organization_name="Annapurna Hunger Relief Trust",
            registration_number="REG-TS-2020-5541",
            mission_statement="Zero food waste in culinary banquets by connecting directly with community kitchens.",
            contact_person="Sunita Reddy",
            operating_areas="Old City, Malakpet, Abids",
            capacity_meals_per_day=500,
            verification_status=VerificationStatus.verified,
            verified_at=datetime.utcnow() - timedelta(days=20),
            verified_by=admin.id
        )
        ngo_prof3 = NGOProfile(
            user_id=ngo3_user.id,
            organization_name="Care & Share Volunteer Alliance",
            registration_number="PENDING-DOCS-2026",
            mission_statement="Mobilizing university student volunteers for quick neighborhood redistribution.",
            contact_person="Kiran Kumar",
            operating_areas="Kondapur, Gachibowli",
            capacity_meals_per_day=150,
            verification_status=VerificationStatus.pending,
        )
        db.add_all([ngo_prof1, ngo_prof2, ngo_prof3])
        db.flush()

        # 4. Food Donations
        now = datetime.utcnow()

        # Donation 1: Available (Cooked Buffet)
        don1 = FoodDonation(
            donor_id=donor1.id,
            title="Surplus Catered Wedding Buffet - Veg Biryani & Paneer Curry",
            description="Freshly prepared premium basmati rice biryani, paneer butter masala, dal tadka, and wheat rotis from an evening wedding banquet. Packed in food-grade thermal containers.",
            food_category=FoodCategory.catered_buffet,
            quantity_value=50.0,
            quantity_unit=QuantityUnit.servings,
            preparation_time=now - timedelta(hours=2),
            expiry_deadline=now + timedelta(hours=6),
            pickup_address="Grand Horizon Hotel, Banquet Hall 2 Loading Bay, Road 1 Banjara Hills",
            pickup_instructions="Enter via service gate on east side. Ask for Chef Anand at the dispatch desk.",
            latitude=17.4156,
            longitude=78.4487,
            storage_condition=StorageCondition.hot_holding,
            allergens="Dairy, Cashew Nuts",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.available,
            created_at=now - timedelta(hours=1),
        )

        # Donation 2: Available (Artisan Bakery)
        don2 = FoodDonation(
            donor_id=donor3.id,
            title="Fresh Artisan Sourdough Breads & Morning Pastries",
            description="Assorted baked goods including whole wheat sourdough loaves, butter croissants, cinnamon rolls and multigrain baguettes. Untouched and wrapped in bakery paper bags.",
            food_category=FoodCategory.bakery,
            quantity_value=35.0,
            quantity_unit=QuantityUnit.boxes,
            preparation_time=now - timedelta(hours=5),
            expiry_deadline=now + timedelta(hours=28),
            pickup_address="Green Leaf Bistro, Madhapur Main Road",
            pickup_instructions="Front counter entrance. Boxes are pre-labeled for FoodBridge pickup.",
            latitude=17.4483,
            longitude=78.3915,
            storage_condition=StorageCondition.ambient,
            allergens="Gluten, Eggs, Dairy",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.available,
            created_at=now - timedelta(hours=3),
        )

        # Donation 3: Available (Supermarket Fresh Produce)
        don3 = FoodDonation(
            donor_id=donor2.id,
            title="Seasonal Fresh Vegetables & Ripe Fruit Crates",
            description="Wholesome carrots, tomatoes, bell peppers, spinach bunches, and fresh apples. Surplus from morning retail distribution, in excellent edible condition.",
            food_category=FoodCategory.produce_fruits_vegetables,
            quantity_value=80.0,
            quantity_unit=QuantityUnit.kg,
            preparation_time=now - timedelta(hours=10),
            expiry_deadline=now + timedelta(hours=48),
            pickup_address="FreshMart Jubilee Hills, Back Warehouse Ramp",
            pickup_instructions="Report to security gate 3 with vehicle registration number.",
            latitude=17.4319,
            longitude=78.4073,
            storage_condition=StorageCondition.refrigerated,
            allergens="None",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.available,
            created_at=now - timedelta(hours=4),
        )

        # Donation 4: Requested
        don4 = FoodDonation(
            donor_id=donor1.id,
            title="Assorted Healthy Boxed Meals (Rice, Dal, Veggies)",
            description="Nutritious packed lunch meal boxes prepared for an IT corporate seminar.",
            food_category=FoodCategory.cooked_meals,
            quantity_value=40.0,
            quantity_unit=QuantityUnit.servings,
            preparation_time=now - timedelta(hours=3),
            expiry_deadline=now + timedelta(hours=8),
            pickup_address="Grand Horizon Hotel, Road 1 Banjara Hills",
            pickup_instructions="Security guard booth at gate 1.",
            latitude=17.4156,
            longitude=78.4487,
            storage_condition=StorageCondition.ambient,
            allergens="Dairy",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.requested,
            created_at=now - timedelta(hours=2),
        )

        # Donation 5: Accepted / Ready for Pickup
        don5 = FoodDonation(
            donor_id=donor3.id,
            title="Fresh Pasta & Tomato Basil Sauce Platters",
            description="Freshly cooked penne arrabbiata and garlic toast platters from lunch rush surplus.",
            food_category=FoodCategory.cooked_meals,
            quantity_value=25.0,
            quantity_unit=QuantityUnit.servings,
            preparation_time=now - timedelta(hours=3),
            expiry_deadline=now + timedelta(hours=5),
            pickup_address="Green Leaf Bistro, Hitech City",
            pickup_instructions="Side collection door near kitchen exit.",
            latitude=17.4483,
            longitude=78.3915,
            storage_condition=StorageCondition.hot_holding,
            allergens="Gluten, Dairy",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.ready_for_pickup,
            created_at=now - timedelta(hours=2),
        )

        # Donation 6: Completed (Historical)
        don6 = FoodDonation(
            donor_id=donor2.id,
            title="Dairy Surplus - Fresh Milk, Yogurt & Cottage Cheese",
            description="Pasteurized milk cartons, plain yogurt tubs, and sealed paneer packets near use-by date.",
            food_category=FoodCategory.dairy,
            quantity_value=60.0,
            quantity_unit=QuantityUnit.packets,
            preparation_time=now - timedelta(days=2),
            expiry_deadline=now - timedelta(days=1),
            pickup_address="FreshMart Jubilee Hills",
            pickup_instructions="Cold storage dock 2.",
            latitude=17.4319,
            longitude=78.4073,
            storage_condition=StorageCondition.refrigerated,
            allergens="Dairy",
            safety_declaration_accepted=True,
            image_url="https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800&auto=format&fit=crop&q=80",
            status=DonationStatus.completed,
            created_at=now - timedelta(days=2),
        )

        db.add_all([don1, don2, don3, don4, don5, don6])
        db.flush()

        # 5. Requests
        req4 = DonationRequest(
            donation_id=don4.id,
            ngo_id=ngo1_user.id,
            message="We have a volunteer van in Banjara Hills that can pick this up in 30 minutes for the Gandhi Nagar shelter home.",
            status=RequestStatus.pending,
            estimated_pickup_time=now + timedelta(minutes=45),
            requested_at=now - timedelta(minutes=30),
        )

        req5 = DonationRequest(
            donation_id=don5.id,
            ngo_id=ngo2_user.id,
            message="Annapurna Trust van is nearby in Madhapur and ready for immediate collection.",
            status=RequestStatus.accepted,
            estimated_pickup_time=now + timedelta(minutes=20),
            decision_notes="Accepted. Food is packed in hot bags.",
            requested_at=now - timedelta(hours=1),
            responded_at=now - timedelta(minutes=45),
        )

        req6 = DonationRequest(
            donation_id=don6.id,
            ngo_id=ngo1_user.id,
            message="We can distribute refrigerated dairy to local orphanages.",
            status=RequestStatus.accepted,
            requested_at=now - timedelta(days=2),
            responded_at=now - timedelta(days=2, hours=-1),
        )

        db.add_all([req4, req5, req6])
        db.flush()

        # 6. Collections
        col5 = DonationCollection(
            donation_id=don5.id,
            request_id=req5.id,
            ngo_id=ngo2_user.id,
            donor_id=donor3.id,
            verification_code="582194",
            donor_confirmed=False,
            ngo_confirmed=False,
            temperature_check_celsius=65.5,
            transport_method="Insulated Van",
        )

        col6 = DonationCollection(
            donation_id=don6.id,
            request_id=req6.id,
            ngo_id=ngo1_user.id,
            donor_id=donor2.id,
            verification_code="814920",
            donor_confirmed=True,
            ngo_confirmed=True,
            donor_confirmed_at=now - timedelta(days=1, hours=20),
            ngo_confirmed_at=now - timedelta(days=1, hours=20),
            collected_at=now - timedelta(days=1, hours=20),
            completed_at=now - timedelta(days=1, hours=20),
            collection_notes="Transferred in refrigerated vehicle at 4°C. Distributed directly to Rainbow Home for Children.",
            temperature_check_celsius=4.2,
            transport_method="Refrigerated Van",
        )
        db.add_all([col5, col6])
        db.flush()

        # 7. Feedback
        fb1 = Feedback(
            donation_id=don6.id,
            reviewer_id=ngo1_user.id,
            recipient_id=donor2.id,
            rating=5,
            comment="Excellent quality milk and cheese cartons in pristine chilled condition. Distributed to over 90 children seamlessly.",
            created_at=now - timedelta(days=1, hours=18),
        )
        db.add(fb1)

        # 8. Report (Sample open report for Admin management)
        rep1 = Report(
            reporter_id=ngo1_user.id,
            donation_id=None,
            reported_user_id=donor3.id,
            reason="Unclear packaging label guidelines",
            details="Requesting that donors label items containing common nuts prominently on external packaging. Handled amicably with donor team.",
            status=ReportStatus.open,
            created_at=now - timedelta(days=1),
        )
        db.add(rep1)

        # 9. Notifications
        notif1 = Notification(
            user_id=ngo1_user.id,
            title="New Donation Available Nearby",
            message=f"Grand Horizon Hotel posted 50 servings of Catered Buffet in Banjara Hills.",
            notification_type=NotificationType.system,
            related_donation_id=don1.id,
            is_read=False,
            created_at=now - timedelta(hours=1),
        )
        notif2 = Notification(
            user_id=donor1.id,
            title="New Donation Request",
            message="Hope Food Relief Foundation requested your listing 'Assorted Healthy Boxed Meals'.",
            notification_type=NotificationType.request_received,
            related_donation_id=don4.id,
            is_read=False,
            created_at=now - timedelta(minutes=30),
        )
        notif3 = Notification(
            user_id=ngo2_user.id,
            title="Food Ready For Pickup!",
            message=f"Green Leaf Bistro marked 'Fresh Pasta Platters' ready. Handover OTP: 582194.",
            notification_type=NotificationType.ready_for_pickup,
            related_donation_id=don5.id,
            is_read=False,
            created_at=now - timedelta(minutes=15),
        )
        db.add_all([notif1, notif2, notif3])

        db.commit()
        print("Database seeded successfully with demo users, donations, requests, and collections!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()


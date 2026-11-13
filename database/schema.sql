-- FoodBridge Database Schema
-- Target: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS foodbridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodbridge_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role ENUM('donor', 'ngo', 'admin') NOT NULL,
    phone VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. NGO Profiles Table
CREATE TABLE IF NOT EXISTS ngo_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    organization_name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    certificate_url VARCHAR(255) NULL,
    mission_statement TEXT NULL,
    contact_person VARCHAR(100) NULL,
    operating_areas VARCHAR(255) NULL,
    capacity_meals_per_day INT DEFAULT 100,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_at DATETIME NULL,
    verified_by INT NULL,
    rejection_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ngo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ngo_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ngo_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Food Donations Table
CREATE TABLE IF NOT EXISTS food_donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    food_category ENUM('cooked_meals', 'bakery', 'produce_fruits_vegetables', 'dairy', 'packaged_groceries', 'beverages', 'catered_buffet', 'other') NOT NULL,
    quantity_value DECIMAL(10, 2) NOT NULL,
    quantity_unit ENUM('kg', 'servings', 'boxes', 'packets', 'liters') NOT NULL,
    preparation_time DATETIME NULL,
    expiry_deadline DATETIME NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_instructions TEXT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    storage_condition ENUM('ambient', 'refrigerated', 'frozen', 'hot_holding') NOT NULL DEFAULT 'ambient',
    allergens VARCHAR(255) NULL,
    safety_declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(255) NULL,
    status ENUM('available', 'requested', 'accepted', 'ready_for_pickup', 'collected', 'completed', 'rejected', 'expired', 'cancelled') NOT NULL DEFAULT 'available',
    cancellation_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donation_status (status),
    INDEX idx_donation_category (food_category),
    INDEX idx_donation_expiry (expiry_deadline),
    INDEX idx_donation_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Donation Requests Table
CREATE TABLE IF NOT EXISTS donation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    ngo_id INT NOT NULL,
    message TEXT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    estimated_pickup_time DATETIME NULL,
    decision_notes TEXT NULL,
    responded_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    CONSTRAINT fk_request_ngo FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_req_donation (donation_id),
    INDEX idx_req_ngo (ngo_id),
    INDEX idx_req_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Donation Collections Table
CREATE TABLE IF NOT EXISTS donation_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL UNIQUE,
    request_id INT NOT NULL UNIQUE,
    ngo_id INT NOT NULL,
    donor_id INT NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    donor_confirmed BOOLEAN DEFAULT FALSE,
    ngo_confirmed BOOLEAN DEFAULT FALSE,
    donor_confirmed_at DATETIME NULL,
    ngo_confirmed_at DATETIME NULL,
    collected_at DATETIME NULL,
    completed_at DATETIME NULL,
    collection_notes TEXT NULL,
    temperature_check_celsius DECIMAL(5, 2) NULL,
    transport_method VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_col_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    CONSTRAINT fk_col_request FOREIGN KEY (request_id) REFERENCES donation_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_col_ngo FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_col_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('request_received', 'request_accepted', 'request_rejected', 'ready_for_pickup', 'collected', 'completed', 'expiry_alert', 'account_verified', 'system') NOT NULL,
    related_donation_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_donation FOREIGN KEY (related_donation_id) REFERENCES food_donations(id) ON DELETE SET NULL,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    recipient_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    CONSTRAINT fk_feed_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feed_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    donation_id INT NULL,
    reported_user_id INT NULL,
    reason VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    status ENUM('open', 'investigating', 'resolved', 'dismissed') DEFAULT 'open',
    admin_resolution_notes TEXT NULL,
    resolved_by INT NULL,
    resolved_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rep_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rep_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE SET NULL,
    CONSTRAINT fk_rep_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_rep_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rep_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


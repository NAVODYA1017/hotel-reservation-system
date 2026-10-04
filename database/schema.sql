-- Hotel Reservation System — Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hotel_reservation_system;
USE hotel_reservation_system;

-- ============================
-- USERS  (UC-01)
-- ============================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER','RECEPTIONIST','EVENT_COORDINATOR','HOTEL_MANAGER','SYSTEM_ADMIN','FINANCE_EXECUTIVE')
        NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- ROOMS  (UC-02)
-- ============================
CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 0.00,
    capacity INT NOT NULL DEFAULT 2,
    status ENUM('AVAILABLE','OCCUPIED','MAINTENANCE','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    description TEXT
);

-- ============================
-- EVENT HALLS  (UC-03)
-- ============================
CREATE TABLE event_halls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_per_event DECIMAL(10,2) NOT NULL,
    seating_capacity INT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255)
);

-- ============================
-- PACKAGES  (UC-03)
-- ============================
CREATE TABLE packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    services_included VARCHAR(255)
);

-- ============================
-- RESERVATIONS  (UC-04 — either a room OR a hall+package, never both)
-- ============================
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room_id BIGINT NULL,
    hall_id BIGINT NULL,
    package_id BIGINT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reservation_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_reservation_hall FOREIGN KEY (hall_id) REFERENCES event_halls(id),
    CONSTRAINT fk_reservation_package FOREIGN KEY (package_id) REFERENCES packages(id),
    CONSTRAINT chk_room_or_hall CHECK (
        (room_id IS NOT NULL AND hall_id IS NULL) OR
        (room_id IS NULL AND hall_id IS NOT NULL)
    )
);

-- ============================
-- PAYMENTS  (UC-05)
-- ============================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('CARD','CASH','BANK_TRANSFER') NOT NULL,
    status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- ============================
-- INVOICES  (UC-05)
-- ============================
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL UNIQUE,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ============================
-- Seed data (optional — for demoing to the client early)
-- ============================
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@hotel.com', 'CHANGE_ME_HASHED', 'HOTEL_MANAGER');

INSERT INTO rooms (room_number, room_type, price, status) VALUES
('101', 'Deluxe', 15000.00, 'AVAILABLE'),
('102', 'Standard', 9000.00, 'AVAILABLE');

INSERT INTO event_halls
(name, price_per_event, seating_capacity, available, description)
VALUES
    (
        'Grand Ballroom',
        250000.00,
        300,
        TRUE,
        'Large event hall suitable for weddings and special events'
    );

INSERT INTO packages (name, description, price, services_included) VALUES
    (
        'Wedding Essentials',
        'Basic wedding event package',
        500000.00,
        'Basic catering, decor, and sound system'
    );

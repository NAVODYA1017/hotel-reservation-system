// ═══════════════════════════════════════════════════════════════════════
// FILE    : ReservationResponse.java
// ROLE    : Data Transfer Object (DTO) – Outbound Response Body
// ═══════════════════════════════════════════════════════════════════════
//
// ── PURPOSE & ARCHITECTURE ─────────────────────────────────────────────
// This DTO formats reservation records returned to the client. It flattens
// nested JPA relationships (User, Room, EventHall, Package) into clean,
// JSON-friendly properties, avoiding circular serialization issues.
// ═══════════════════════════════════════════════════════════════════════

package com.hotel.reservationsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Outbound response payload representing a confirmed, pending, or modified booking.
 */
@Data
public class ReservationResponse {

    // ── CORE BOOKING METRICS ──────────────────────────────────────────
    private Long id;
    private String confirmationCode; // e.g. "RES-3FA9B01C"
    private String status;           // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    // ── GUEST DETAILS ────────────────────────────────────────────────
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // ── ROOM DETAILS (if room booking) ────────────────────────────────
    private Long roomId;
    private String roomNumber;       // e.g. "101"
    private String roomType;         // e.g. "DELUXE"

    // ── HALL & PACKAGE DETAILS (if hall booking) ──────────────────────
    private Long hallId;
    private String hallName;         // e.g. "Grand Sapphire Ballroom"
    private Long packageId;
    private String packageName;      // e.g. "Royal Heritage Wedding Bundle"

    // ── CONVENIENCE GETTERS FOR FRONTEND COMPATIBILITY ───────────────
    public String getReservationId() {
        return confirmationCode != null ? confirmationCode : "RES-" + id;
    }

    public String getGuestName() {
        return userName;
    }

    public String getGuestEmail() {
        return userEmail;
    }

    public LocalDate getCheckInDate() {
        return checkIn;
    }

    public LocalDate getCheckOutDate() {
        return checkOut;
    }
}

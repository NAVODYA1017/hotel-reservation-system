// ═══════════════════════════════════════════════════════════════════════
// FILE    : ReservationRequest.java
// ROLE    : Data Transfer Object (DTO) – Inbound Request Body
// ═══════════════════════════════════════════════════════════════════════
//
// ── PURPOSE & ARCHITECTURE ─────────────────────────────────────────────
// This DTO encapsulates data transmitted from the client when creating or
// modifying a reservation. Decouples the internal JPA entity schema from
// the public API contract.
// ═══════════════════════════════════════════════════════════════════════

package com.hotel.reservationsystem.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.time.LocalDate;

/**
 * Inbound payload representing booking or modification parameters.
 * Lombok's @Data automatically generates getters, setters, equals, hashCode, and toString.
 */
@Data
public class ReservationRequest {

    // ── GUEST IDENTIFICATION ──────────────────────────────────────────
    private Long userId;        // Set if guest is logged in
    private String guestEmail;  // Email for guest checkout / lookup
    private String guestName;   // Full name for guest checkout

    // ── BOOKING TARGET (Room OR Hall, never both) ──────────────────────
    private Long roomId;        // Target room ID (for room reservation)
    private Long hallId;        // Target event hall ID (for event hall reservation)
    private Long packageId;     // Optional package bundle ID (for event hall)

    // ── RESERVATION TIMEFRAME ─────────────────────────────────────────
    // @JsonAlias allows JSON payloads using checkIn, checkInDate, or check_in
    @JsonAlias({"checkInDate", "check_in"})
    private LocalDate checkIn;

    @JsonAlias({"checkOutDate", "check_out"})
    private LocalDate checkOut;
}

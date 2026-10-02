// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomRequest.java
// UC   : UC-02 – Manage Hotel Rooms (Teammate 2: Akmal R.N.M.A. - IT25102920)
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS A DTO?
//   A DTO (Data Transfer Object) is a plain Java object used to transfer
//   data between the client (React frontend) and the server (Spring Boot).
//   It isolates the database entity from the external API contract.
//
// WHAT DOES THIS CLASS DO?
//   Captures the data submitted by a receptionist when creating or
//   updating a hotel room in the system.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// RoomStatus     – Enum representing room availability (AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE).
// BigDecimal     – High-precision decimal type for monetary values (pricePerNight).
// Lombok:
//   @Data        – Auto-generates getters, setters, toString(), equals(), hashCode().
//   @NoArgsConstructor  – Auto-generates empty constructor for Jackson JSON deserialization.
//   @AllArgsConstructor – Auto-generates constructor with all fields.
//   @Builder     – Provides builder pattern for clean object instantiation.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data                // Lombok: eliminates boilerplate getters and setters.
@NoArgsConstructor   // Lombok: generates default no-args constructor for JSON mapping.
@AllArgsConstructor  // Lombok: generates constructor with all fields.
@Builder             // Lombok: allows fluent builder pattern: RoomRequest.builder()...
public class RoomRequest {

    // Room number – e.g. "101", "205-A". Must be unique.
    private String roomNumber;

    // Room type – e.g. "Standard", "Deluxe", "Executive Suite".
    private String roomType;

    // Nightly rate – BigDecimal avoids floating-point precision issues with currency.
    private BigDecimal pricePerNight;

    // Maximum number of guests the room can accommodate.
    private Integer capacity;

    // Room status – defaults to AVAILABLE if not specified.
    private RoomStatus status;

    // Description of amenities, bed configuration, view, etc.
    private String description;
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallRequest.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS A DTO?
//   Transfers client form data into the backend without directly exposing
//   the underlying JPA entity. Decouples the API contract from the DB schema.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// JsonAlias     – Allows Jackson JSON parser to accept alternate JSON keys
//                 (e.g., accepting 'capacity' for 'seatingCapacity' and
//                 'pricePerDay' for 'pricePerEvent').
// BigDecimal    – Monetary precision decimal to avoid floating-point loss.
// Lombok:
//   @Data       – Generates getters, setters, equals, hashCode, toString.
//   @NoArgsConstructor  – Required by Jackson for JSON deserialization.
//   @AllArgsConstructor – Full arguments constructor.
//   @Builder    – Enables the fluent builder pattern.
// ─────────────────────────────────────────────────────────────────────────
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventHallRequest {


    private String name;

    @JsonAlias({"pricePerDay", "price"})
    private BigDecimal pricePerEvent;

    @JsonAlias({"capacity"})
    private Integer seatingCapacity;

    // Whether the hall is available for bookings or under maintenance
    private Boolean available;

    // Description of amenities, facilities, AV equipment, etc.
    @JsonAlias({"amenities"})
    private String description;
}

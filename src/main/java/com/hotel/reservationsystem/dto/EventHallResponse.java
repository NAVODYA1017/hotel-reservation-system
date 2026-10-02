// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallResponse.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS A RESPONSE DTO?
//   Encapsulates event hall data returned to the frontend or customer.
//   Provides consistent schema with helper getters for UI compatibility.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// EventHall      – The JPA Entity being transformed into a DTO.
// EventHallStatus– Derived status enum: AVAILABLE, UNAVAILABLE.
// BigDecimal     – High-precision type for event hall rates.
// Lombok:
//   @Data        – Auto-generates getters, setters, toString, equals, hashCode.
//   @Builder     – Fluent builder pattern support.
//   @NoArgsConstructor, @AllArgsConstructor – Constructors for mapping.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventHallResponse {

    private Long id;
    private String name;
    private BigDecimal pricePerEvent;
    private int seatingCapacity;
    private boolean available;
    private String description;
    private EventHallStatus status;

    // ─────────────────────────────────────────────────────────────────
    // UI COMPATIBILITY ALIASES
    // ─────────────────────────────────────────────────────────────────
    public BigDecimal getPricePerDay() {
        return pricePerEvent;
    }

    public int getCapacity() {
        return seatingCapacity;
    }

    public String getAmenities() {
        return description;
    }

    // ─────────────────────────────────────────────────────────────────
    // STATIC FACTORY MAPPER (Entity → Response DTO)
    // ─────────────────────────────────────────────────────────────────
    public static EventHallResponse fromEntity(EventHall hall) {
        if (hall == null) return null;
        return EventHallResponse.builder()
                .id(hall.getId())
                .name(hall.getName())
                .pricePerEvent(hall.getPricePerEvent())
                .seatingCapacity(hall.getSeatingCapacity())
                .available(hall.isAvailable())
                .description(hall.getDescription())
                .status(hall.getStatus())
                .build();
    }
}

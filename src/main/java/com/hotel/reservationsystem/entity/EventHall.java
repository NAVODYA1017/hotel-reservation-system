// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHall.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Entity (maps to the "event_halls" table in MySQL)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// @JsonIgnore       – Hides a field/method from JSON output.
// EventHallStatus   – Enum: AVAILABLE, UNAVAILABLE (derived from the boolean).
// jakarta.persistence.* – JPA annotations for ORM (Object-Relational Mapping).
// Lombok            – Generates boilerplate code (getters, setters, constructors).
// BigDecimal        – Precise decimal type for monetary values.
// ─────────────────────────────────────────────────────────────────────────
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity                          // JPA entity → maps to a database table.
@Table(name = "event_halls")     // MySQL table name.
@Data                            // Lombok: getters + setters + toString + equals + hashCode.
@NoArgsConstructor               // Lombok: public EventHall() {}
@AllArgsConstructor              // Lombok: public EventHall(Long id, String name, ...)
public class EventHall {

    @Id  // Primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment in MySQL.
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;  // e.g. "Grand Ballroom"

    // DECIMAL(10,2) in MySQL – used for price to avoid floating-point errors.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerEvent;

    private int seatingCapacity;  // Maximum number of guests.

    @Column(nullable = false)
    private boolean available = true;  // true = can be booked, false = under maintenance.

    @Column(length = 255)
    private String description;

    // @Transient – NOT stored in the database. Computed on the fly from
    //   the 'available' boolean field.
    // Used by UC-06 (Reports) to count halls by status.
    @Transient
    @JsonIgnore
    public EventHallStatus getStatus() {
        return available ? EventHallStatus.AVAILABLE : EventHallStatus.UNAVAILABLE;
    }

    // Alias for UC-04 (ReservationService) which calls hall.getPrice().
    @Transient
    @JsonIgnore
    public BigDecimal getPrice() {
        return pricePerEvent;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : Room.java
// UC   : UC-02 – Manage Hotel Rooms
// LAYER: Entity (maps to the "rooms" table in MySQL database)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// @JsonIgnore    – Excludes a field/method from the JSON output.
// RoomStatus     – Enum: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE.
// @Entity        – Marks this class as a JPA entity (database table).
// @Table         – Specifies the MySQL table name.
// @Id            – Primary key.
// @GeneratedValue – Auto-increment strategy.
// @Column        – Column-level constraints (nullable, unique, length, precision).
// @Enumerated    – How to store enum in DB (STRING = text, ORDINAL = number).
// @Transient     – NOT mapped to any database column. Exists only in Java memory.
// @Data          – Lombok: auto-generates getters, setters, toString, equals, hashCode.
// @NoArgsConstructor – Lombok: generates empty constructor.
// @AllArgsConstructor – Lombok: generates constructor with all fields.
// BigDecimal     – Java class for precise decimal arithmetic (avoids floating-point
//                  rounding errors that double/float have). Used for money/prices.
// ─────────────────────────────────────────────────────────────────────────
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// @Entity – this class is a JPA entity mapped to a database table.
@Entity
// @Table(name = "rooms") – maps to the "rooms" table in MySQL.
@Table(name = "rooms")
// @Data – Lombok generates getters/setters/toString/equals/hashCode.
@Data
@NoArgsConstructor   // Generates: public Room() {}
@AllArgsConstructor  // Generates: public Room(Long id, String roomNumber, ...)
public class Room {

    // Primary key – auto-incremented by MySQL.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // unique = true → no two rooms can have the same room number.
    @Column(nullable = false, unique = true, length = 20)
    private String roomNumber;

    // Room type – e.g. "Deluxe", "Standard", "Suite".
    @Column(nullable = false, length = 50)
    private String roomType;

    // precision = 10, scale = 2 → DECIMAL(10,2) in MySQL.
    //   → Stores up to 10 digits total, with 2 after the decimal point.
    //   → e.g. 99999999.99 is the maximum value.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    // @Enumerated(EnumType.STRING) → stores "AVAILABLE", "OCCUPIED", etc. as text.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;  // Default: room is available.

    @Column(length = 255)
    private String description;

    // Maximum number of guests this room can accommodate.
    private int capacity;

    // @Transient → this method is NOT a database column.
    //   It's a convenience alias so UC-04 (ReservationService) can call
    //   room.getPrice() instead of room.getPricePerNight().
    // @JsonIgnore → don't include this in JSON output (avoids duplicate data).
    @Transient
    @JsonIgnore
    public BigDecimal getPrice() {
        return pricePerNight;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : Reservation.java
// UC   : UC-04 – Create and Manage Reservation
// LAYER: Entity (maps to the "reservations" table in MySQL)
//
// A reservation can be for either a ROOM or an EVENT HALL (never both).
// The constraint chk_room_or_hall in the database schema enforces this.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// ReservationStatus – Enum: PENDING, CONFIRMED, AWAITING_PAYMENT, PAID, CANCELLED, COMPLETED.
// ReservationType   – Enum: ROOM, EVENT_HALL.
// @ManyToOne        – JPA relationship annotation. Many reservations can belong
//                     to one user. Many reservations can use one room, etc.
// FetchType.LAZY    – The related entity is NOT loaded from the database until
//                     you actually access it. This improves performance.
//                     (EAGER would load it immediately, which is slower.)
// @JoinColumn       – Specifies the foreign key column in this table that
//                     references the primary key of the related table.
// @Transient        – Field/method is NOT stored in the database.
// BigDecimal        – Precise decimal arithmetic for money.
// LocalDate         – Date without time (e.g. 2026-10-01).
// LocalDateTime     – Date WITH time (e.g. 2026-10-01T14:30:00).
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.ReservationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity                            // JPA entity → maps to a database table.
@Table(name = "reservations")      // MySQL table name.
@Data                              // Lombok: getters + setters + toString + equals + hashCode.
@NoArgsConstructor                 // Lombok: empty constructor.
@AllArgsConstructor                // Lombok: all-fields constructor.
public class Reservation {

    @Id  // Primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment.
    private Long id;

    // Unique booking reference code, e.g. "RES-20261001-1234".
    @Column(nullable = false, unique = true, length = 20)
    private String confirmationCode;

    // @ManyToOne – Many reservations can belong to ONE user (customer).
    // FetchType.LAZY – the User object is loaded from DB only when accessed.
    // @JoinColumn(name = "user_id") – the foreign key column in reservations table
    //   that references users.id.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Type of reservation: ROOM or EVENT_HALL.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationType reservationType;

    // @ManyToOne – Many reservations can use the SAME room.
    //   NULL if this is an event hall booking.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    // NULL if this is a room booking.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id")
    private EventHall hall;

    // Optional add-on package (only for event hall bookings).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private Package eventPackage;

    // Check-in date (not including time).
    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    // Check-out date (not including time).
    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    // Total cost of the reservation (calculated: price × nights, or hall + package price).
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // How much the customer has paid so far (tracks partial payments).
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;  // Default: nothing paid yet.

    // Current status of the reservation.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private ReservationStatus status = ReservationStatus.PENDING;  // Default: pending.

    // When this reservation was created (set once, never updated).
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // @PrePersist – runs before the first INSERT to ensure createdAt is set.
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // @Transient – not stored in the database. Calculated on the fly.
    // Returns how much the customer still owes: totalAmount - amountPaid.
    @Transient
    public BigDecimal getBalanceDue() {
        return totalAmount.subtract(amountPaid == null ? BigDecimal.ZERO : amountPaid);
    }
}

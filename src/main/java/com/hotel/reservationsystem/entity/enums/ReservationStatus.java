// ═══════════════════════════════════════════════════════════════════════
// Enum: ReservationStatus – Lifecycle states of a reservation (UC-04).
// Stored as STRING in the "status" column of the "reservations" table.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum ReservationStatus {
    PENDING,           // Reservation created but not yet confirmed or paid.
    CONFIRMED,         // Reservation has been confirmed by staff.
    AWAITING_PAYMENT,  // Partial payment received; balance still due.
    PAID,              // Full payment received; reservation is fully paid.
    CANCELLED,         // Reservation was cancelled by the customer or staff.
    COMPLETED          // Guest has checked out; reservation is complete.
}

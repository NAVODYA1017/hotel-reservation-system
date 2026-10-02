// ═══════════════════════════════════════════════════════════════════════
// Enum: ReservationType – Whether the reservation is for a room or an event hall.
// Stored as STRING in the "reservation_type" column of the "reservations" table.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum ReservationType {
    ROOM,          // Guest is booking a hotel room.
    EVENT_HALL     // Guest is booking an event hall (optionally with a package).
}

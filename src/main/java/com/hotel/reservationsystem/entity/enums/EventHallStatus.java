// ═══════════════════════════════════════════════════════════════════════
// Enum: EventHallStatus – Derived status for event halls (UC-03/UC-06).
// NOT stored directly in the database. The EventHall entity stores a boolean
// "available" field, and this enum is computed from it using getStatus().
// Used by UC-06 (Reports) to count halls by status.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum EventHallStatus {
    AVAILABLE,     // Hall can be booked (available = true).
    UNAVAILABLE    // Hall is under maintenance or not available (available = false).
}

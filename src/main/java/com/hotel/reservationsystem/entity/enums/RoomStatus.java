// ═══════════════════════════════════════════════════════════════════════
// Enum: RoomStatus – Possible states of a hotel room (UC-02).
// Stored as STRING in the "status" column of the "rooms" table.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum RoomStatus {
    AVAILABLE,      // Room is free and can be booked by a guest.
    RESERVED,       // Room has been booked but the guest hasn't checked in yet.
    OCCUPIED,       // Guest has checked in and is currently using the room.
    MAINTENANCE     // Room is under maintenance/cleaning and cannot be booked.
}
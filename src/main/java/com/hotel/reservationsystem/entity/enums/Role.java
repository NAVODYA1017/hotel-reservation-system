// ═══════════════════════════════════════════════════════════════════════
// FILE : Role.java
// WHAT : Enum defining all possible user roles in the Hotel Reservation System.
//
// WHAT IS AN ENUM?
//   An enum (enumeration) is a special Java class that represents a FIXED SET
//   of constants. Each constant is an instance of the enum class.
//   Using enums instead of plain strings prevents typos and invalid values.
//
// HOW IT'S USED:
//   - Stored in the "role" column of the "users" table as a STRING
//     (because of @Enumerated(EnumType.STRING) in User.java).
//   - Used in AdminAccessService to check if a user has admin privileges.
//   - Used in ReportService to count users by role.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum Role {
    CUSTOMER,            // Regular guest who can browse rooms, make bookings, and pay.
    RECEPTIONIST,        // Front desk staff who checks guests in/out and records cash payments.
    EVENT_COORDINATOR,   // Staff who manages event hall bookings and packages.
    HOTEL_MANAGER,       // Manager with full admin access (manage users, reports, settings).
    SYSTEM_ADMIN,        // IT admin with the highest privileges (can manage other admins).
    FINANCE_EXECUTIVE    // Finance staff who can view reports but cannot manage users/settings.
}

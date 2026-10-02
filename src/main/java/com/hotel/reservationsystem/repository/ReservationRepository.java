// ═══════════════════════════════════════════════════════════════════════
// FILE : ReservationRepository.java
// UC   : UC-04 – Create and Manage Reservation
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository<Reservation, Long> to get free CRUD methods.
// UC-02 (Rooms) and UC-05 (Payments) use this repository.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Reservation;  // Entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository  // Spring auto-generates the implementation at runtime.
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // Custom check: used by UC-02 RoomService to check if a room is linked
    // to any active reservations before deleting (Open Issue 1).
    boolean existsByRoom_Id(Long roomId);

    // Find all reservations linked to a specific room
    List<Reservation> findByRoom_Id(Long roomId);

    // Find all reservations created by a specific user (UC-04 Page 9)
    List<Reservation> findByUser_Id(Long userId);

    // ── UC-03 EVENT HALL & PACKAGE CONSTRAINTS (Extension 7b & Open Issue 1) ──
    // Checks if any reservations are linked to this event hall
    boolean existsByHall_Id(Long hallId);

    // Checks if any active (non-cancelled) reservations exist for this hall
    boolean existsByHall_IdAndStatusNot(Long hallId, com.hotel.reservationsystem.entity.enums.ReservationStatus status);

    // Checks if any reservations are linked to this event package
    boolean existsByEventPackage_Id(Long packageId);

    // Checks if any active (non-cancelled) reservations exist for this package
    boolean existsByEventPackage_IdAndStatusNot(Long packageId, com.hotel.reservationsystem.entity.enums.ReservationStatus status);
}

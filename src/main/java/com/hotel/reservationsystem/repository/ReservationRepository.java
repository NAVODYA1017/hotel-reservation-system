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
}

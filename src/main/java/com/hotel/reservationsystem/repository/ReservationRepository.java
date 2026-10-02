// ═══════════════════════════════════════════════════════════════════════
// FILE : ReservationRepository.java
// UC   : UC-04 – Create and Manage Reservation
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository<Reservation, Long> to get free CRUD methods.
// UC-05 (Payments) uses findById/save/findAll on this repository.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Reservation;  // Entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository  // Spring auto-generates the implementation at runtime.
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    // Inherits: save(), findById(), findAll(), deleteById(), count(), existsById()
}

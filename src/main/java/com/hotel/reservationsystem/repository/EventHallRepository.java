// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallRepository.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository<EventHall, Long> to get free CRUD methods.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.EventHall;    // Entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository; // CRUD operations.
import org.springframework.stereotype.Repository;

@Repository  // Spring auto-generates the implementation at runtime.
public interface EventHallRepository extends JpaRepository<EventHall, Long> {
    // Inherits: save(), findById(), findAll(), deleteById(), count(), existsById()
}

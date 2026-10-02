// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomRepository.java
// UC   : UC-02 – Manage Hotel Rooms
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository<Room, Long> to get free CRUD methods:
//   save(), findById(), findAll(), deleteById(), count(), existsById()
// Spring Data JPA generates the implementation at runtime – no SQL needed.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Room;         // The entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository; // Provides CRUD operations.
import org.springframework.stereotype.Repository;        // Marks this as a data access bean.

@Repository  // Spring auto-generates the implementation.
public interface RoomRepository extends JpaRepository<Room, Long> {
    // Inherits all CRUD methods from JpaRepository.
    // Custom query methods can be added here, e.g.:
    //   List<Room> findByStatus(RoomStatus status);
    //   Optional<Room> findByRoomNumber(String roomNumber);
}
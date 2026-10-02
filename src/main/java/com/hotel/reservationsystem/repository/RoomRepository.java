// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomRepository.java
// UC   : UC-02 – Manage Hotel Rooms (Teammate 2: Akmal R.N.M.A. - IT25102920)
// LAYER: Repository (Data Access Layer – talks to MySQL database)
//
// WHAT IS A REPOSITORY?
//   A Spring Data JPA repository provides pre-built CRUD methods:
//     - save(Room room)          → INSERT or UPDATE room record
//     - findById(Long id)        → SELECT * FROM rooms WHERE id = ?
//     - findAll()                → SELECT * FROM rooms
//     - deleteById(Long id)      → DELETE FROM rooms WHERE id = ?
//     - count()                  → SELECT COUNT(*) FROM rooms
//     - existsById(Long id)      → SELECT EXISTS(...)
//
// WHAT ARE CUSTOM QUERY METHODS?
//   Spring Data JPA derives the SQL query directly from the method name!
//   No SQL queries or JPQL statements need to be handwritten.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// Room          – JPA entity mapped to the "rooms" table.
// RoomStatus    – Enum: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE.
// JpaRepository – Spring Data JPA interface with built-in database methods.
// @Repository   – Spring stereotype annotation marking this as a Data Access bean.
// List, Optional – Standard Java collection & null-safe wrapper types.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository // Spring instantiates a proxy implementation of this interface at startup.
public interface RoomRepository extends JpaRepository<Room, Long> {

    // 1. Filter rooms by status (e.g. find all AVAILABLE rooms for customers):
    //    SQL generated: SELECT * FROM rooms WHERE status = ?
    List<Room> findByStatus(RoomStatus status);

    // 2. Find a room by its room number (e.g. "101"):
    //    SQL generated: SELECT * FROM rooms WHERE room_number = ?
    Optional<Room> findByRoomNumber(String roomNumber);

    // 3. Fast boolean check if a room number already exists (Extension 5a: duplicate check):
    //    SQL generated: SELECT COUNT(*) > 0 FROM rooms WHERE room_number = ?
    boolean existsByRoomNumber(String roomNumber);
}
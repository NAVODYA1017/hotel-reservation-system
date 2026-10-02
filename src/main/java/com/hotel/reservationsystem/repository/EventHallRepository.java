// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallRepository.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: Repository (Data Access Layer)
//
// WHAT IS A REPOSITORY?
//   A Spring Data JPA interface that provides automatic data access
//   and object-relational mapping without writing raw SQL.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// EventHall      – The JPA Entity this repository manages (maps to "event_halls").
// JpaRepository  – Spring Data interface providing standard CRUD operations.
// Repository     – Stereotype annotation marking this as a Data Access Component.
// List / Optional– Standard Java utility types for single/multiple query results.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.EventHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository // Marks interface as a Spring-managed Data Access Object (DAO)
public interface EventHallRepository extends JpaRepository<EventHall, Long> {

    // ─────────────────────────────────────────────────────────────────
    // CUSTOM QUERY METHODS
    // Spring Data JPA derives the SQL query directly from the method name:
    // ─────────────────────────────────────────────────────────────────

    // findByAvailable → SELECT * FROM event_halls WHERE available = ?
    // Used by Step 12 for customers to browse only available halls.
    List<EventHall> findByAvailable(boolean available);

    // existsByNameIgnoreCase → SELECT COUNT(*) > 0 FROM event_halls WHERE LOWER(name) = LOWER(?)
    // Used in Step 8 to prevent duplicate hall names.
    boolean existsByNameIgnoreCase(String name);

    // findByName → SELECT * FROM event_halls WHERE name = ?
    Optional<EventHall> findByName(String name);
}

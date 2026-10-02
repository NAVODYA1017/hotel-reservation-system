// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageRepository.java
// LAYER: Repository (Data Access Layer)
//
// WHAT IS A REPOSITORY?
//   A Spring Data JPA repository that abstracts database queries for
//   the "packages" table, automatically generating SQL from method signatures.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// Package        – The JPA Entity representing customizable event packages.
// JpaRepository  – Spring Data framework interface providing full CRUD methods.
// Repository     – Indicates a Data Access Object component in Spring's hierarchy.
// Optional       – Container object which may or may not contain a non-null value.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring component that encapsulates storage, retrieval, and search
public interface PackageRepository extends JpaRepository<Package, Long> {

    // ─────────────────────────────────────────────────────────────────
    // CUSTOM QUERY METHODS
    // ─────────────────────────────────────────────────────────────────

    // existsByNameIgnoreCase → SELECT COUNT(*) > 0 FROM packages WHERE LOWER(name) = LOWER(?)
    // Implements Extension 11a: "If a package already exists, system prevents duplicate creation."
    boolean existsByNameIgnoreCase(String name);

    // findByName → SELECT * FROM packages WHERE name = ?
    Optional<Package> findByName(String name);
}

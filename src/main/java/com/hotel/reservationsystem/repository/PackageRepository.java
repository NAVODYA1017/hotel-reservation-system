// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageRepository.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository<Package, Long> to get free CRUD methods.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Package;      // Entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository  // Spring auto-generates the implementation at runtime.
public interface PackageRepository extends JpaRepository<Package, Long> {
    // Inherits: save(), findById(), findAll(), deleteById(), count(), existsById()
}

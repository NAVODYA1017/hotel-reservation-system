// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageRepository.java
// LAYER: Repository (Data Access Layer)
//
// WHAT IS A REPOSITORY?
//   A Spring Data JPA repository that abstracts database queries for
//   the "packages" table, automatically generating SQL from method signatures.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;


import com.hotel.reservationsystem.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring component that encapsulates storage, retrieval, and search
public interface PackageRepository extends JpaRepository<Package, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Package> findByName(String name);
}

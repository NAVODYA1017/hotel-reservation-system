// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallRepository.java
// LAYER: Repository (Data Access Layer)
//
// WHAT IS A REPOSITORY?
//   A Spring Data JPA interface that provides automatic data access
//   and object-relational mapping without writing raw SQL.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;


import com.hotel.reservationsystem.entity.EventHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository // Marks interface as a Spring managed Data Access Object (DAO)
public interface EventHallRepository extends JpaRepository<EventHall, Long> {

    List<EventHall> findByAvailable(boolean available);

    boolean existsByNameIgnoreCase(String name);

    Optional<EventHall> findByName(String name);
}

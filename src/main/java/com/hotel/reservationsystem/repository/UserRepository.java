// ═══════════════════════════════════════════════════════════════════════
// FILE : UserRepository.java
// UC   : UC-01 – User Account Management (Teammate 1: Sandeepani H.G.K.)
// LAYER: Repository (Data Access Layer – talks to the database)
//
// WHAT IS A REPOSITORY?
//   A repository is an interface that provides methods to perform database
//   operations (CRUD: Create, Read, Update, Delete) WITHOUT writing SQL.
//   Spring Data JPA automatically generates the implementation at runtime.
//
// HOW DOES IT WORK?
//   By extending JpaRepository<User, Long>, this interface AUTOMATICALLY
//   inherits these methods (no code needed):
//     - save(User entity)        → INSERT or UPDATE a user.
//     - findById(Long id)        → SELECT * FROM users WHERE id = ?
//     - findAll()                → SELECT * FROM users
//     - count()                  → SELECT COUNT(*) FROM users
//     - deleteById(Long id)      → DELETE FROM users WHERE id = ?
//     - existsById(Long id)      → SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)
//   You can also add CUSTOM query methods by just naming them correctly:
//     - findByEmail(String email) → SELECT * FROM users WHERE email = ?
//     Spring generates the SQL from the method name automatically!
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Custom query method required for UC-01 (User Account Management):
    // Spring Data JPA derives: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : User.java
// UC   : UC-01 – Manage User Account
// LAYER: Entity (maps to the "users" table in MySQL database)
//
// WHAT IS AN ENTITY?
//   An entity is a Java class that represents a table in the database.
//   Each instance (object) of this class represents one ROW in that table.
//   Each field in this class represents one COLUMN in that table.
//   JPA (Java Persistence API) handles the mapping automatically.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// @JsonIgnore         – Jackson annotation. Tells the JSON serializer to SKIP
//                       this field when converting the object to JSON.
//                       Used on passwordHash so the password is NEVER sent
//                       to the frontend in API responses.
// Role                – Custom enum defining the system roles.
// jakarta.persistence.* – JPA annotations that define how this class maps to
//                         the database table:
//   @Entity           – marks this class as a JPA entity (database table).
//   @Table            – specifies the table name in the database.
//   @Id               – marks the primary key field.
//   @GeneratedValue   – tells JPA to auto-generate the primary key value
//                       (AUTO_INCREMENT in MySQL).
//   @Column           – configures column properties (nullable, unique, length).
//   @Enumerated       – tells JPA how to store enum values in the database.
//                       EnumType.STRING stores the enum NAME as text (e.g. "CUSTOMER").
//   @PrePersist       – lifecycle callback: method runs BEFORE the entity is
//                       first inserted into the database.
// Lombok annotations:
//   @Data             – generates getters, setters, toString(), equals(), hashCode()
//                       for ALL fields. This eliminates boilerplate code.
//   @NoArgsConstructor – generates a no-argument constructor: User().
//   @AllArgsConstructor – generates a constructor with ALL fields as parameters.
// LocalDateTime       – Java 8+ date-time class for timestamps.
// ─────────────────────────────────────────────────────────────────────────
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// @Entity – tells JPA that this class maps to a database table.
//   → Hibernate (the JPA implementation) will create/update the table automatically
//     because spring.jpa.hibernate.ddl-auto=update in application.properties.
@Entity
// @Table(name = "users") – the table name in MySQL is "users".
@Table(name = "users")
// @Data – Lombok annotation that generates getters, setters, toString, equals, hashCode.
@Data
// @NoArgsConstructor – generates: public User() {}
@NoArgsConstructor
// @AllArgsConstructor – generates: public User(Long id, String name, String email, ...)
@AllArgsConstructor
public class User {

    // @Id – marks this field as the PRIMARY KEY of the table.
    @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY) – the database auto-generates
    //   the id using AUTO_INCREMENT (MySQL). Each new user gets the next number.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column(nullable = false) – this column CANNOT be NULL in the database.
    //   length = 100 – maximum 100 characters (VARCHAR(100) in MySQL).
    @Column(nullable = false, length = 100)
    private String name;

    // unique = true – no two users can have the same email (UNIQUE constraint in MySQL).
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // @JsonIgnore – NEVER include the password hash in JSON responses.
    //   This is a critical security measure.
    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 20)
    private String phoneNumber;

    // @Enumerated(EnumType.STRING) – stores the enum value as a STRING in the database.
    //   e.g., the column will contain "CUSTOMER", "RECEPTIONIST", etc.
    //   (EnumType.ORDINAL would store the index number 0, 1, 2... which is fragile.)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Role role = Role.CUSTOMER;  // Default role for new users.

    @Column(nullable = false)
    private boolean active = true;  // Soft delete – deactivated accounts still exist in DB.

    // updatable = false – this column is set once during INSERT and never updated.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // @PrePersist – JPA lifecycle callback.
    //   This method is automatically called BEFORE the entity is first saved (INSERT).
    //   It ensures createdAt is set to the current timestamp.
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : Package.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Entity (maps to the "packages" table in MySQL)
//
// A Package represents an add-on service bundle (e.g. catering, decor,
// multimedia) that can be selected when booking an event hall.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// jakarta.persistence.* – JPA annotations (@Entity, @Table, @Id, @Column, etc.).
// Lombok                – Code generation annotations (@Data, @NoArgsConstructor, etc.).
// BigDecimal            – Precise decimal type for monetary amounts.
// ─────────────────────────────────────────────────────────────────────────
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity                       // JPA entity → database table.
@Table(name = "packages")     // Maps to "packages" table in MySQL.
@Data                         // Lombok: auto-generates getters, setters, toString, etc.
@NoArgsConstructor            // Lombok: generates empty constructor.
@AllArgsConstructor           // Lombok: generates all-fields constructor.
public class Package {

    @Id  // Primary key of the packages table.
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // AUTO_INCREMENT in MySQL.
    private Long id;

    // Package name, e.g. "Wedding Essentials", "Premium Decor".
    @Column(nullable = false, length = 100)
    private String name;

    // Detailed description of what's included in the package.
    @Column(length = 255)
    private String description;

    // Price of the package – DECIMAL(10,2) in MySQL.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Comma-separated list of services, e.g. "Catering, Decor, Sound System".
    @Column(length = 255)
    private String servicesIncluded;
}

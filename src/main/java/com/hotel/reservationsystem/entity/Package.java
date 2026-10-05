// ═══════════════════════════════════════════════════════════════════════
// FILE : Package.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Entity (maps to the "packages" table in MySQL)
//
// A Package represents an add-on service bundle (e.g. catering, decor,
// multimedia) that can be selected when booking an event hall.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "packages")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  //auto increment
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 255)
    private String servicesIncluded;
}

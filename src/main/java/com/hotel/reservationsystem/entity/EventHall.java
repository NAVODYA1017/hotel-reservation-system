// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHall.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Entity (maps to the "event_halls" table in MySQL)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "event_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class EventHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // auto increment
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;


    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerEvent;

    private int seatingCapacity;

    @Column(nullable = false)
    private boolean available = true;

    @Column(length = 255)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    // @Transient – not stored in the database computed on the fly from
    @Transient
    @JsonIgnore
    public EventHallStatus getStatus() {
        return available ? EventHallStatus.AVAILABLE : EventHallStatus.UNAVAILABLE;
    }


    @Transient
    @JsonIgnore
    public BigDecimal getPrice() {
        return pricePerEvent;
    }
}

package com.hotel.reservationsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Shared foundation entity (UC-03: Manage Event Halls and Packages).
 * Kept here so the Payment & Billing module (UC-05) can compile and run
 * standalone; owned/maintained by the Event Hall & Package Management member.
 */
@Entity
@Table(name = "event_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    /** Derived status used by UC-06 reports (not a persisted column). */
    @Transient
    @JsonIgnore
    public EventHallStatus getStatus() {
        return available ? EventHallStatus.AVAILABLE : EventHallStatus.UNAVAILABLE;
    }

    /** Alias for UC-04 (ReservationService), which reads this as "price". */
    @Transient
    @JsonIgnore
    public BigDecimal getPrice() {
        return pricePerEvent;
    }
}

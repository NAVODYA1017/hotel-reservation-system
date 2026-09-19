package com.hotel.reservationsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Shared foundation entity (UC-02: Manage Hotel Rooms).
 * Kept here so the Payment & Billing module (UC-05) can compile and run
 * standalone; owned/maintained by the Room Management member.
 */
@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String roomNumber;

    @Column(nullable = false, length = 50)
    private String roomType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(length = 255)
    private String description;

    private int capacity;

    /** Alias for UC-04 (ReservationService), which reads this as "price". */
    @Transient
    @JsonIgnore
    public BigDecimal getPrice() {
        return pricePerNight;
    }
}

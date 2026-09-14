package com.hotel.reservationsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservationResponse {

    // Reservation info
    private Long id;
    private String status;        // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    // Customer info
    private Long userId;
    private String userName;

    // What was booked (only one of these will be filled)
    private String roomNumber;    // e.g. "101"
    private String roomType;      // e.g. "Deluxe"

    private String hallName;      // e.g. "Grand Ballroom"
    private String packageName;   // e.g. "Wedding Essentials"
}

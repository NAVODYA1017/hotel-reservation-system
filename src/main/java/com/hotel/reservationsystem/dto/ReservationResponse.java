package com.hotel.reservationsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservationResponse {

    // Reservation info
    private Long id;
    private String confirmationCode;
    private String status;        // PENDING, CONFIRMED, CANCELLED, COMPLETED
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;

    // Customer info
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // What was booked (only one of these will be filled)
    private Long roomId;
    private String roomNumber;    // e.g. "101"
    private String roomType;      // e.g. "Deluxe"

    private Long hallId;
    private String hallName;      // e.g. "Grand Ballroom"
    private Long packageId;
    private String packageName;   // e.g. "Wedding Essentials"

    // Frontend compatibility helpers
    public String getReservationId() {
        return confirmationCode != null ? confirmationCode : "RES-" + id;
    }

    public String getGuestName() {
        return userName;
    }

    public String getGuestEmail() {
        return userEmail;
    }

    public LocalDate getCheckInDate() {
        return checkIn;
    }

    public LocalDate getCheckOutDate() {
        return checkOut;
    }
}


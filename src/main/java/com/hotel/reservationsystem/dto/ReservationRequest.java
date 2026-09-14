package com.hotel.reservationsystem.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservationRequest {

    // WHO is making the reservation
    private Long userId;

    // WHAT are they booking (room OR hall, never both)
    private Long roomId;       // set this if booking a room
    private Long hallId;       // set this if booking a hall
    private Long packageId;    // optional — only if booking a hall with a package

    // WHEN
    private LocalDate checkIn;
    private LocalDate checkOut;
}

package com.hotel.reservationsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * What GET /api/admin/reports/reservations sends back.
 * Covers every reservation whose check-in date falls inside [fromDate, toDate].
 */
@Getter
@Setter
public class ReservationReportResponse {
    private String reportType = "RESERVATION";
    private LocalDate fromDate;
    private LocalDate toDate;
    private LocalDateTime generatedAt;

    // Extension 6a - tells the admin when there is no data for the period
    private String message;

    private long totalReservations;
    private Map<String, Long> reservationsByStatus;
    private long roomBookings;
    private long hallBookings;
    private Map<String, Long> bookingsByRoomType;

    // Sum of total_amount for reservations that were NOT cancelled
    private BigDecimal totalBookingValue;
    private double cancellationRatePercent;

    private List<ReservationResponse> reservations;
}

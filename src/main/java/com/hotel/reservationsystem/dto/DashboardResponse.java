package com.hotel.reservationsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * What GET /api/admin/dashboard sends back (UC-06 steps 2-3).
 * The "...ByStatus" / "...ByRole" maps always contain every enum value, even when the count is 0.
 */
@Getter
@Setter
public class DashboardResponse {
    private LocalDateTime generatedAt;

    // Users
    private long totalUsers;
    private long totalCustomers;
    private long totalStaff;
    private Map<String, Long> usersByRole;

    // Rooms and event halls
    private long totalRooms;
    private Map<String, Long> roomsByStatus;
    private long totalEventHalls;
    private Map<String, Long> hallsByStatus;

    // Reservations
    private long totalReservations;
    private Map<String, Long> reservationsByStatus;
    private long todayCheckIns;
    private long todayCheckOuts;
    private long upcomingReservationsNext7Days;

    // Revenue (successful payments only)
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private BigDecimal totalRefunded;
}

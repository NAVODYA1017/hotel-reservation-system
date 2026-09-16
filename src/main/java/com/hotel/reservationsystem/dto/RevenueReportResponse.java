package com.hotel.reservationsystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * What GET /api/admin/reports/revenue sends back.
 * Covers every payment whose paid_at date falls inside [fromDate, toDate].
 *
 * grossRevenue  = successful + later-refunded payments
 * refundedAmount = payments that were refunded
 * netRevenue    = grossRevenue - refundedAmount
 */
@Getter
@Setter
public class RevenueReportResponse {
    private String reportType = "REVENUE";
    private LocalDate fromDate;
    private LocalDate toDate;
    private LocalDateTime generatedAt;

    // Extension 6a - tells the admin when there is no data for the period
    private String message;

    private long successfulPayments;
    private long refundedPayments;
    private BigDecimal grossRevenue;
    private BigDecimal refundedAmount;
    private BigDecimal netRevenue;
    private BigDecimal averagePaymentValue;

    // Net revenue broken down different ways
    private Map<String, BigDecimal> revenueByPaymentMethod;
    private Map<String, BigDecimal> revenueByBookingType;   // ROOM / EVENT_HALL
    private Map<LocalDate, BigDecimal> dailyRevenue;

    private List<PaymentResponse> payments;
}

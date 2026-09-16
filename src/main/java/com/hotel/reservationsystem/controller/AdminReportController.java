package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.DashboardResponse;
import com.hotel.reservationsystem.dto.ReportTypeResponse;
import com.hotel.reservationsystem.dto.ReservationReportResponse;
import com.hotel.reservationsystem.dto.RevenueReportResponse;
import com.hotel.reservationsystem.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * UC-06 dashboard and reports.
 * Every request must send the logged-in user's id in the "X-User-Id" header
 * (see AdminAccessService). Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN, FINANCE_EXECUTIVE.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminReportController {

    @Autowired
    private ReportService reportService;

    // GET http://localhost:8080/api/admin/dashboard
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return reportService.getDashboard(userId);
    }

    // GET http://localhost:8080/api/admin/reports
    @GetMapping("/reports")
    public List<ReportTypeResponse> getReportTypes(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return reportService.getReportTypes(userId);
    }

    // GET http://localhost:8080/api/admin/reports/reservations?from=2026-09-01&to=2026-09-30
    // from/to are optional - default is the 1st of this month to today
    @GetMapping("/reports/reservations")
    public ReservationReportResponse getReservationReport(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.generateReservationReport(userId, from, to);
    }

    // GET http://localhost:8080/api/admin/reports/revenue?from=2026-09-01&to=2026-09-30
    // from/to are optional - default is the 1st of this month to today
    @GetMapping("/reports/revenue")
    public RevenueReportResponse getRevenueReport(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.generateRevenueReport(userId, from, to);
    }
}

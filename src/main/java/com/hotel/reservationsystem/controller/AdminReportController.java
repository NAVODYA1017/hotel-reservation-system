package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.DashboardResponse;
import com.hotel.reservationsystem.dto.ReportTypeResponse;
import com.hotel.reservationsystem.dto.ReservationReportResponse;
import com.hotel.reservationsystem.dto.RevenueReportResponse;
import com.hotel.reservationsystem.service.ReportService;
import com.hotel.reservationsystem.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * UC-06 dashboard and reports.
 * Every request must send the sign-in token as "Authorization: Bearer <token>"
 * (see AdminAuthService). Role checks happen in AdminAccessService. Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN, FINANCE_EXECUTIVE.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminReportController {

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private ReportService reportService;

    // GET http://localhost:8080/api/admin/dashboard
    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return reportService.getDashboard(adminAuthService.currentUserId(authorization));
    }

    // GET http://localhost:8080/api/admin/reports
    @GetMapping("/reports")
    public List<ReportTypeResponse> getReportTypes(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return reportService.getReportTypes(adminAuthService.currentUserId(authorization));
    }

    // GET http://localhost:8080/api/admin/reports/reservations?from=2026-09-01&to=2026-09-30
    // from/to are optional - default is the 1st of this month to today
    @GetMapping("/reports/reservations")
    public ReservationReportResponse getReservationReport(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.generateReservationReport(adminAuthService.currentUserId(authorization), from, to);
    }

    // GET http://localhost:8080/api/admin/reports/revenue?from=2026-09-01&to=2026-09-30
    // from/to are optional - default is the 1st of this month to today
    @GetMapping("/reports/revenue")
    public RevenueReportResponse getRevenueReport(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.generateRevenueReport(adminAuthService.currentUserId(authorization), from, to);
    }
}

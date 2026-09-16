package com.hotel.reservationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * One entry in the list returned by GET /api/admin/reports (UC-06 step 5).
 * {
 *   "code": "REVENUE",
 *   "name": "Revenue Report",
 *   "description": "...",
 *   "endpoint": "/api/admin/reports/revenue?from=yyyy-MM-dd&to=yyyy-MM-dd"
 * }
 */
@Getter
@Setter
@AllArgsConstructor
public class ReportTypeResponse {
    private String code;
    private String name;
    private String description;
    private String endpoint;
}

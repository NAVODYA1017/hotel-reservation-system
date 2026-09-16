package com.hotel.reservationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * One system setting returned by GET/PUT /api/admin/settings
 * {
 *   "key": "tax.rate",
 *   "value": "8.0",
 *   "description": "Tax percentage applied to invoices",
 *   "updatedAt": "2026-09-16T10:15:00"
 * }
 */
@Getter
@Setter
@AllArgsConstructor
public class SystemSettingResponse {
    private String key;
    private String value;
    private String description;
    private LocalDateTime updatedAt;
}

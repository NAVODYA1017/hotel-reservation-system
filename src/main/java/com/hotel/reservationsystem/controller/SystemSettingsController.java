package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.SystemSettingResponse;
import com.hotel.reservationsystem.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UC-06 "Manage System Settings".
 * Every request must send the logged-in user's id in the "X-User-Id" header
 * (see AdminAccessService). Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    // GET http://localhost:8080/api/admin/settings
    @GetMapping
    public List<SystemSettingResponse> getSettings(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return systemSettingsService.getAllSettings(userId);
    }

    // PUT http://localhost:8080/api/admin/settings
    // Body - send only the settings you want to change:
    // { "tax.rate": "10", "checkin.time": "15:00" }
    @PutMapping
    public List<SystemSettingResponse> updateSettings(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                      @RequestBody Map<String, String> settings) {
        return systemSettingsService.updateSettings(userId, settings);
    }

    // PUT http://localhost:8080/api/admin/settings/tax.rate/reset
    @PutMapping("/{key}/reset")
    public List<SystemSettingResponse> resetSetting(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                    @PathVariable String key) {
        return systemSettingsService.resetSetting(userId, key);
    }
}

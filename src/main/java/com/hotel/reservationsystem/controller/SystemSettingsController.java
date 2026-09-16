package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.SystemSettingResponse;
import com.hotel.reservationsystem.service.SystemSettingsService;
import com.hotel.reservationsystem.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UC-06 "Manage System Settings".
 * Every request must send the sign-in token as "Authorization: Bearer <token>"
 * (see AdminAuthService). Role checks happen in AdminAccessService. Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/settings")
public class SystemSettingsController {

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private SystemSettingsService systemSettingsService;

    // GET http://localhost:8080/api/admin/settings
    @GetMapping
    public List<SystemSettingResponse> getSettings(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return systemSettingsService.getAllSettings(adminAuthService.currentUserId(authorization));
    }

    // PUT http://localhost:8080/api/admin/settings
    // Body - send only the settings you want to change:
    // { "tax.rate": "10", "checkin.time": "15:00" }
    @PutMapping
    public List<SystemSettingResponse> updateSettings(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                      @RequestBody Map<String, String> settings) {
        return systemSettingsService.updateSettings(adminAuthService.currentUserId(authorization), settings);
    }

    // PUT http://localhost:8080/api/admin/settings/tax.rate/reset
    @PutMapping("/{key}/reset")
    public List<SystemSettingResponse> resetSetting(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                    @PathVariable String key) {
        return systemSettingsService.resetSetting(adminAuthService.currentUserId(authorization), key);
    }
}

package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.SystemSettingResponse;
import com.hotel.reservationsystem.exception.InvalidRequestException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * UC-06 "Manage System Settings" (steps 11-12).
 *
 * Settings are stored as key/value rows in a small "system_settings" table.
 * UC-06 may only add code in dto/service/controller/exception (no new entity or
 * repository), so this service uses JdbcTemplate and creates the table itself on
 * startup if it doesn't exist yet. Default values are inserted once and never
 * overwrite values an administrator has already saved.
 */
@Service
public class SystemSettingsService {

    // key -> { default value, description }. Order here = order returned to the UI.
    private static final Map<String, String[]> SETTINGS = new LinkedHashMap<>();

    static {
        SETTINGS.put("hotel.name", new String[]{"Grand Horizon Hotel", "Name shown on invoices and the site header"});
        SETTINGS.put("hotel.email", new String[]{"info@grandhorizon.lk", "Contact email for guests"});
        SETTINGS.put("hotel.phone", new String[]{"+94 11 234 5678", "Reception phone number"});
        SETTINGS.put("hotel.address", new String[]{"Colombo 03, Sri Lanka", "Postal address"});
        SETTINGS.put("currency", new String[]{"LKR", "Currency code used for all prices"});
        SETTINGS.put("tax.rate", new String[]{"8.0", "Tax percentage applied to invoices"});
        SETTINGS.put("checkin.time", new String[]{"14:00", "Standard check-in time"});
        SETTINGS.put("checkout.time", new String[]{"11:00", "Standard check-out time"});
        SETTINGS.put("cancellation.hours", new String[]{"48", "Hours before check-in that a free cancellation is allowed"});
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AdminAccessService adminAccessService;

    @PostConstruct
    public void initSettingsTable() {
        jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS system_settings (" +
                "  id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "  setting_key VARCHAR(100) NOT NULL UNIQUE," +
                "  setting_value VARCHAR(255) NOT NULL," +
                "  description VARCHAR(255) NULL," +
                "  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP" +
                ")");

        for (Map.Entry<String, String[]> setting : SETTINGS.entrySet()) {
            jdbcTemplate.update(
                    "INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)",
                    setting.getKey(), setting.getValue()[0], setting.getValue()[1]);
        }
    }

    // ──────────────────────────────────────────────
    // 1. VIEW ALL SETTINGS
    // ──────────────────────────────────────────────
    public List<SystemSettingResponse> getAllSettings(Long actingUserId) {
        adminAccessService.requireAdmin(actingUserId);
        return loadSettings();
    }

    // ──────────────────────────────────────────────
    // 2. UPDATE ONE OR MORE SETTINGS (step 12: validate, then save)
    // All values are validated first; if any is invalid nothing is saved.
    // ──────────────────────────────────────────────
    @Transactional
    public List<SystemSettingResponse> updateSettings(Long actingUserId, Map<String, String> changes) {
        adminAccessService.requireAdmin(actingUserId);

        if (changes == null || changes.isEmpty()) {
            throw new InvalidRequestException("No settings were provided to update.");
        }

        List<String> errors = new ArrayList<>();
        Map<String, String> cleaned = new LinkedHashMap<>();
        for (Map.Entry<String, String> change : changes.entrySet()) {
            String key = change.getKey();
            if (!SETTINGS.containsKey(key)) {
                errors.add("Unknown setting '" + key + "'");
                continue;
            }
            String value = change.getValue() == null ? "" : change.getValue().trim();
            String error = validate(key, value);
            if (error != null) {
                errors.add(error);
            } else {
                cleaned.put(key, value);
            }
        }

        if (!errors.isEmpty()) {
            throw new InvalidRequestException("Settings not saved. " + String.join("; ", errors) + ".");
        }

        cleaned.forEach(this::saveValue);
        return loadSettings();
    }

    // ──────────────────────────────────────────────
    // 3. RESET ONE SETTING TO ITS DEFAULT VALUE
    // ──────────────────────────────────────────────
    @Transactional
    public List<SystemSettingResponse> resetSetting(Long actingUserId, String key) {
        adminAccessService.requireAdmin(actingUserId);
        if (!SETTINGS.containsKey(key)) {
            throw new ResourceNotFoundException("Setting not found: " + key);
        }
        saveValue(key, SETTINGS.get(key)[0]);
        return loadSettings();
    }

    /**
     * For other modules that need a setting value (e.g. invoices reading "tax.rate").
     * No admin check - reading a setting value is not an administration action.
     */
    public String getSettingValue(String key) {
        if (!SETTINGS.containsKey(key)) {
            throw new ResourceNotFoundException("Setting not found: " + key);
        }
        List<String> values = jdbcTemplate.queryForList(
                "SELECT setting_value FROM system_settings WHERE setting_key = ?", String.class, key);
        return values.isEmpty() ? SETTINGS.get(key)[0] : values.get(0);
    }

    // ──────────────────────────────────────────────
    // HELPER: upsert one value (the row may be missing if someone deleted it)
    // ──────────────────────────────────────────────
    private void saveValue(String key, String value) {
        jdbcTemplate.update(
                "INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP",
                key, value, SETTINGS.get(key)[1]);
    }

    // ──────────────────────────────────────────────
    // HELPER: read rows, in the same order as SETTINGS
    // ──────────────────────────────────────────────
    private List<SystemSettingResponse> loadSettings() {
        Map<String, SystemSettingResponse> stored = new HashMap<>();
        jdbcTemplate.query("SELECT setting_key, setting_value, updated_at FROM system_settings", rs -> {
            String key = rs.getString("setting_key");
            if (!SETTINGS.containsKey(key)) {
                return;
            }
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            stored.put(key, new SystemSettingResponse(
                    key,
                    rs.getString("setting_value"),
                    SETTINGS.get(key)[1],
                    updatedAt != null ? updatedAt.toLocalDateTime() : null));
        });

        List<SystemSettingResponse> result = new ArrayList<>();
        for (Map.Entry<String, String[]> setting : SETTINGS.entrySet()) {
            result.add(stored.getOrDefault(setting.getKey(),
                    new SystemSettingResponse(setting.getKey(), setting.getValue()[0], setting.getValue()[1], null)));
        }
        return result;
    }

    // ──────────────────────────────────────────────
    // HELPER: returns an error message, or null if the value is valid
    // ──────────────────────────────────────────────
    private String validate(String key, String value) {
        switch (key) {
            case "hotel.name":
                return value.isEmpty() || value.length() > 100 ? "hotel.name must be 1-100 characters" : null;
            case "hotel.email":
                return value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") ? null : "hotel.email must be a valid email address";
            case "hotel.phone":
                return value.matches("^\\+?[0-9 ]{9,20}$") ? null
                        : "hotel.phone must contain 9-20 digits/spaces, optionally starting with +";
            case "hotel.address":
                return value.isEmpty() || value.length() > 255 ? "hotel.address must be 1-255 characters" : null;
            case "currency":
                return value.matches("^[A-Z]{3}$") ? null : "currency must be a 3-letter uppercase code such as LKR";
            case "tax.rate":
                return validateDecimalRange(key, value, BigDecimal.ZERO, BigDecimal.valueOf(100));
            case "checkin.time":
            case "checkout.time":
                return validateTime(key, value);
            case "cancellation.hours":
                return validateIntRange(key, value, 0, 720);
            default:
                return "Unknown setting '" + key + "'";
        }
    }

    private String validateIntRange(String key, String value, int min, int max) {
        try {
            int number = Integer.parseInt(value);
            return number < min || number > max ? key + " must be between " + min + " and " + max : null;
        } catch (NumberFormatException ex) {
            return key + " must be a whole number";
        }
    }

    private String validateDecimalRange(String key, String value, BigDecimal min, BigDecimal max) {
        try {
            BigDecimal number = new BigDecimal(value);
            return number.compareTo(min) < 0 || number.compareTo(max) > 0
                    ? key + " must be between " + min + " and " + max : null;
        } catch (NumberFormatException ex) {
            return key + " must be a number";
        }
    }

    private String validateTime(String key, String value) {
        if (!value.matches("^\\d{2}:\\d{2}$")) {
            return key + " must use the format HH:mm";
        }
        try {
            LocalTime.parse(value);
            return null;
        } catch (DateTimeParseException ex) {
            return key + " must be a valid time in the format HH:mm";
        }
    }
}

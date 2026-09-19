package com.hotel.reservationsystem.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/** Matches the health-check URL referenced in the team setup guide. */
@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public Map<String, Object> test() {
        return Map.of(
                "status", "UP",
                "message", "Hotel Reservation System - Payment & Billing module is running.",
                "timestamp", LocalDateTime.now().toString()
        );
    }
}

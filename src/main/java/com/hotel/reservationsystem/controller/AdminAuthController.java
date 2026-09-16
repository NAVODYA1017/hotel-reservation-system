package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.AdminLoginRequest;
import com.hotel.reservationsystem.dto.AdminLoginResponse;
import com.hotel.reservationsystem.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * UC-06 administrator sign-in / sign-out (steps 1-2, extension 1a).
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminAuthService adminAuthService;

    // POST http://localhost:8080/api/admin/auth/login
    // Body: { "email": "admin@hotel.com", "password": "..." }
    @PostMapping("/login")
    public AdminLoginResponse login(@RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }

    // POST http://localhost:8080/api/admin/auth/logout   (header: Authorization: Bearer <token>)
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        adminAuthService.logout(authorization);
        return ResponseEntity.ok("Signed out");
    }
}

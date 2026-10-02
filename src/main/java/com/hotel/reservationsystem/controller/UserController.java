// ═══════════════════════════════════════════════════════════════════════
// FILE : UserController.java
// LAYER: Controller (REST API layer)
//
// WHAT DOES THIS CONTROLLER DO?
//   Exposes REST endpoints for:
//     - POST /api/auth/register       → Create a new account
//     - POST /api/auth/login          → Login with email & password
//     - GET  /api/users/{id}          → View user profile
//     - PUT  /api/users/{id}          → Update user profile
//     - PUT  /api/users/{id}/password → Change user password
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.LoginRequest;
import com.hotel.reservationsystem.dto.RegisterRequest;
import com.hotel.reservationsystem.dto.UserResponse;
import com.hotel.reservationsystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController // Tells Spring this class handles HTTP requests and returns JSON.
public class UserController {

    @Autowired // Injects the UserService business logic bean.
    private UserService userService;

    // ─────────────────────────────────────────────────────────────────
    // 1. REGISTER – POST /api/auth/register
    // ─────────────────────────────────────────────────────────────────
    @PostMapping("/api/auth/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. LOGIN – POST /api/auth/login
    // ─────────────────────────────────────────────────────────────────
    @PostMapping("/api/auth/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request) {
        UserResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET PROFILE – GET /api/users/{id}
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/api/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. UPDATE PROFILE – PUT /api/users/{id}
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/api/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. CHANGE PASSWORD – PUT /api/users/{id}/password
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/api/users/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        userService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}

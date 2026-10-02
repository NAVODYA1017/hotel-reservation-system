// ═══════════════════════════════════════════════════════════════════════
// FILE : CustomerAuthController.java
// UC   : UC-01 – Manage User Account (Customer Registration & Login)
// LAYER: Controller (REST API layer)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// User              – JPA entity mapped to the "users" table.
// Role              – Enum defining user roles (CUSTOMER, RECEPTIONIST, etc.).
// UserRepository    – Spring Data JPA interface providing CRUD for users.
// BCryptPasswordEncoder – Spring Security's password hashing utility.
//                         Uses the BCrypt algorithm to one-way hash passwords
//                         so they are never stored in plain text.
// ResponseEntity    – Wraps HTTP response (status code + body).
// HttpStatus        – Enum of HTTP status codes.
// Map               – Java interface for key-value pairs (used for JSON responses).
// HashMap           – Concrete implementation of Map.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

// @RestController – this class handles REST API requests and returns JSON.
@RestController
// @RequestMapping("/api/customer/auth") – base URL for customer authentication endpoints.
@RequestMapping("/api/customer/auth")
public class CustomerAuthController {

    // Inject the UserRepository – provides database CRUD operations for users.
    @Autowired
    private UserRepository userRepository;

    // BCryptPasswordEncoder – used to hash passwords before storing them in the DB,
    //   and to verify passwords during login.
    //   BCrypt is a one-way hashing algorithm, meaning you CANNOT reverse the hash
    //   back to the original password.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ══════════════════════════════════════════════════════════════════════
    // 1. REGISTER – Create a new customer account
    //    HTTP: POST http://localhost:8080/api/customer/auth/register
    //    Body: { "name": "John Doe", "email": "john@example.com",
    //            "passwordHash": "mypassword123", "phoneNumber": "0771234567" }
    //    Note: The frontend sends the raw password in "passwordHash" field;
    //          we hash it here before saving.
    //    Response: 201 CREATED + user details (without password)
    // ══════════════════════════════════════════════════════════════════════
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        // Check if email already exists in the database.
        // findAll() + stream().anyMatch() – searches through all users to find
        //   if any user has the same email (case-insensitive comparison).
        boolean emailExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(user.getEmail()));

        if (emailExists) {
            // HTTP 409 Conflict – indicates that the resource (email) already exists.
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "An account with this email already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        // Hash the password before saving to the database.
        // passwordEncoder.encode() – takes the plain-text password and returns
        //   a BCrypt hash string like "$2a$10$abc...xyz".
        //   This ensures the actual password is NEVER stored in the database.
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        // Force the role to CUSTOMER – new registrations are always customers.
        // This prevents someone from setting their own role to ADMIN via the API.
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        // Save the user to the database.
        // save() performs INSERT since the user has no id yet.
        User savedUser = userRepository.save(user);

        // Build a success response (don't send back the password hash).
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful!");
        response.put("userId", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. LOGIN – Authenticate a customer with email and password
    //    HTTP: POST http://localhost:8080/api/customer/auth/login
    //    Body: { "email": "john@example.com", "password": "mypassword123" }
    //    Response: 200 OK + user details on success, or 401 UNAUTHORIZED on failure
    // ══════════════════════════════════════════════════════════════════════
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        // Extract email and password from the request body.
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Validate that both fields were provided.
        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email and password are required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        // Search for a user with the given email.
        User user = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst()        // findFirst() – returns the first matching user (or empty).
                .orElse(null);      // orElse(null) – returns null if no user was found.

        // Check if user exists AND the password matches the stored hash.
        // passwordEncoder.matches(rawPassword, hashedPassword) – compares the
        //   raw password against the BCrypt hash stored in the database.
        //   Returns true if they match, false otherwise.
        if (user == null || !user.getPasswordHash().startsWith("$2")
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            // HTTP 401 Unauthorized – invalid credentials.
            // Note: We give the same generic message for "no such email" and "wrong password"
            //   to prevent email enumeration attacks.
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Check if the account is active (not deactivated by admin).
        if (!user.isActive()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Your account has been deactivated. Please contact support.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        // Login successful – return user details.
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful!");
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("phoneNumber", user.getPhoneNumber());

        return ResponseEntity.ok(response);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. GET PROFILE – Retrieve the logged-in customer's profile
    //    HTTP: GET http://localhost:8080/api/customer/auth/profile/5
    //    Response: 200 OK + user details, or 404 if not found
    // ══════════════════════════════════════════════════════════════════════
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        // findById() – looks up the user by their primary key.
        return userRepository.findById(userId)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("userId", user.getId());
                    response.put("name", user.getName());
                    response.put("email", user.getEmail());
                    response.put("phoneNumber", user.getPhoneNumber());
                    response.put("role", user.getRole());
                    response.put("createdAt", user.getCreatedAt());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. UPDATE PROFILE – Customer updates their own profile
    //    HTTP: PUT http://localhost:8080/api/customer/auth/profile/5
    //    Body: { "name": "John D.", "phoneNumber": "0779876543" }
    //    Response: 200 OK + updated details, or 404 if not found
    // ══════════════════════════════════════════════════════════════════════
    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable Long userId,
                                                              @RequestBody Map<String, String> updates) {
        return userRepository.findById(userId)
                .map(user -> {
                    // Update name if provided.
                    if (updates.containsKey("name") && !updates.get("name").isBlank()) {
                        user.setName(updates.get("name").trim());
                    }
                    // Update phone number if provided.
                    if (updates.containsKey("phoneNumber")) {
                        user.setPhoneNumber(updates.get("phoneNumber"));
                    }
                    // Update password if provided (must hash it first).
                    if (updates.containsKey("password") && !updates.get("password").isBlank()) {
                        user.setPasswordHash(passwordEncoder.encode(updates.get("password")));
                    }
                    // Save the updated user to the database.
                    User saved = userRepository.save(user);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Profile updated successfully!");
                    response.put("userId", saved.getId());
                    response.put("name", saved.getName());
                    response.put("email", saved.getEmail());
                    response.put("phoneNumber", saved.getPhoneNumber());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

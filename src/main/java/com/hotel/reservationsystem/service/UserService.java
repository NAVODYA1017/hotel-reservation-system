// ═══════════════════════════════════════════════════════════════════════
// FILE : UserService.java
// LAYER: Service (Business Logic Layer)
//
// WHAT DOES THIS CLASS DO?
//   Contains business logic for:
//     1. User registration (hashes password with BCrypt, prevents duplicate email)
//     2. User login (authenticates email and validates password hash)
//     3. Viewing user profile by ID
//     4. Updating user profile
//     5. Changing user password securely
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.LoginRequest;
import com.hotel.reservationsystem.dto.RegisterRequest;
import com.hotel.reservationsystem.dto.UserResponse;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.exception.AuthenticationFailedException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service // Marks this class as a Spring Service bean in the business logic layer.
public class UserService {

    @Autowired // Automatically injects the UserRepository bean.
    private UserRepository userRepository;

    @org.springframework.context.annotation.Lazy
    @Autowired
    private ReservationService reservationService;

    @Autowired
    private com.hotel.reservationsystem.repository.ReservationRepository reservationRepository;

    // BCrypt password encoder for secure, one-way cryptographic password hashing.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─────────────────────────────────────────────────────────────────
    // 1. REGISTER – Registers a new customer account
    // ─────────────────────────────────────────────────────────────────
    @Transactional // Ensures atomic database operation.
    public UserResponse register(RegisterRequest request) {
        // Validation: check if email is already taken
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        // Create new User entity and hash the password using BCrypt
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // Hashed password
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.CUSTOMER); // Default role for public registration

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. LOGIN – Validates email and password
    // ─────────────────────────────────────────────────────────────────
    public UserResponse login(LoginRequest request) {
        // Find user by email or throw authentication exception
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationFailedException("Invalid email or password."));

        // Compare plain-text password with BCrypt hash in database
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationFailedException("Invalid email or password.");
        }

        return mapToResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET PROFILE – Retrieve user details by ID
    // ─────────────────────────────────────────────────────────────────
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. UPDATE PROFILE – Update name and phone number
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. CHANGE PASSWORD – Securely change account password
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Verify existing password
        if (oldPassword != null && !passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new AuthenticationFailedException("Current password does not match.");
        }

        // Hash and save new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. DELETE USER – Delete account and associated data
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Cascade delete reservations tied to the user to prevent foreign key constraint violations
        java.util.List<com.hotel.reservationsystem.entity.Reservation> userReservations = reservationRepository.findByUser_Id(id);
        for (com.hotel.reservationsystem.entity.Reservation res : userReservations) {
            reservationService.deleteReservation(res.getId());
        }

        userRepository.delete(user);
    }

    // Helper method to convert User entity to UserResponse DTO (excludes password)
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

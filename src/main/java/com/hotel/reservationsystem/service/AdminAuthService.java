package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.AdminLoginRequest;
import com.hotel.reservationsystem.dto.AdminLoginResponse;
import com.hotel.reservationsystem.dto.AdminUserResponse;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.exception.AuthenticationFailedException;
import com.hotel.reservationsystem.exception.UnauthorizedAccessException;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * UC-06 steps 1-2 and extension 1a: administrator sign-in with email + password.
 *
 * - The password is checked against users.password_hash with BCrypt (never stored or compared as plain text).
 * - On success a random session token is issued. The admin pages send it on every
 *   request as "Authorization: Bearer <token>", and the controllers turn it back into the user id.
 * - Sessions are kept in memory and expire after 8 hours without activity
 *   (restarting the application signs everyone out).
 * - After 5 wrong passwords an email is locked for 5 minutes.
 *
 * When the team's User Account module (UC-01) adds JWT login, this class can be
 * replaced by reading the user from the Spring Security context.
 */
@Service
public class AdminAuthService {

    private static final Duration SESSION_TIMEOUT = Duration.ofHours(8);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(5);

    private record Session(Long userId, LocalDateTime expiresAt) { }
    private record FailedAttempts(int count, LocalDateTime lockedUntil) { }

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final Map<String, FailedAttempts> failedAttempts = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private UserRepository userRepository;

    // ──────────────────────────────────────────────
    // SIGN IN
    // ──────────────────────────────────────────────
    public AdminLoginResponse login(AdminLoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String password = request.getPassword() == null ? "" : request.getPassword();

        if (email.isEmpty() || password.isEmpty()) {
            throw new AuthenticationFailedException("Enter your email and password.");
        }

        FailedAttempts attempts = failedAttempts.get(email);
        if (attempts != null && attempts.lockedUntil() != null && attempts.lockedUntil().isAfter(LocalDateTime.now())) {
            throw new AuthenticationFailedException(
                    "Too many failed sign-in attempts. Try again after " + attempts.lockedUntil().toLocalTime().withNano(0) + ".");
        }

        User user = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);

        // Same message for "no such email" and "wrong password", so emails can't be guessed
        if (user == null || !passwordMatches(password, user.getPasswordHash())) {
            recordFailure(email);
            throw new AuthenticationFailedException("Invalid email or password.");
        }
        failedAttempts.remove(email);

        // Extension 1a: correct password, but not an administrator role
        if (!AdminAccessService.REPORT_ROLES.contains(user.getRole())) {
            throw new UnauthorizedAccessException(
                    "Access denied. Your role (" + user.getRole() + ") does not have access to administration functions.");
        }

        String token = newToken();
        LocalDateTime expiresAt = LocalDateTime.now().plus(SESSION_TIMEOUT);
        sessions.put(token, new Session(user.getId(), expiresAt));

        return new AdminLoginResponse(token, expiresAt, AdminUserResponse.fromEntity(user, 0));
    }

    // ──────────────────────────────────────────────
    // SIGN OUT
    // ──────────────────────────────────────────────
    public void logout(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        if (token != null) {
            sessions.remove(token);
        }
    }

    /**
     * Used by every UC-06 controller: turns "Authorization: Bearer <token>" into the signed-in user's id.
     * Throws 401 if the token is missing, unknown or expired. The role check itself happens
     * afterwards in AdminAccessService, using the user's CURRENT role from the database.
     */
    public Long currentUserId(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        if (token == null) {
            throw new AuthenticationFailedException("Please sign in to use administration functions.");
        }

        Session session = sessions.get(token);
        if (session == null || session.expiresAt().isBefore(LocalDateTime.now())) {
            sessions.remove(token);
            throw new AuthenticationFailedException("Your session is invalid or has expired. Please sign in again.");
        }

        // Sliding expiry: stay signed in while active
        sessions.put(token, new Session(session.userId(), LocalDateTime.now().plus(SESSION_TIMEOUT)));
        return session.userId();
    }

    // ──────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────
    private boolean passwordMatches(String rawPassword, String storedHash) {
        // Rows with a placeholder instead of a BCrypt hash (e.g. seed data) can never sign in
        if (storedHash == null || !storedHash.startsWith("$2")) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, storedHash);
    }

    private void recordFailure(String email) {
        failedAttempts.compute(email, (key, previous) -> {
            int count = (previous == null ? 0 : previous.count()) + 1;
            if (count >= MAX_FAILED_ATTEMPTS) {
                return new FailedAttempts(0, LocalDateTime.now().plus(LOCK_TIME));
            }
            return new FailedAttempts(count, null);
        });
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authorizationHeader.substring(7).trim();
        return token.isEmpty() ? null : token;
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.AdminUserRequest;
import com.hotel.reservationsystem.dto.AdminUserResponse;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.exception.InvalidRequestException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.exception.UnauthorizedAccessException;
import com.hotel.reservationsystem.repository.ReservationRepository;
import com.hotel.reservationsystem.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * UC-06 "Manage Users & Roles" (steps 10 and 12, extension 10a).
 *
 * Authorization rules:
 *  - Only HOTEL_MANAGER or SYSTEM_ADMIN can manage accounts.
 *  - Only a SYSTEM_ADMIN can create, edit, delete or grant the SYSTEM_ADMIN role.
 *  - An administrator cannot delete their own account or change their own role.
 *  - Accounts that have reservations cannot be deleted (keeps booking/payment history intact).
 */
@Service
public class AdminUserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int MIN_PASSWORD_LENGTH = 8;

    @Autowired
    private AdminAccessService adminAccessService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ──────────────────────────────────────────────
    // 1. LIST ACCOUNTS (optionally filtered by role)
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers(Long actingUserId, Role roleFilter) {
        adminAccessService.requireAdmin(actingUserId);

        Map<Long, Long> reservationCounts = reservationCountsByUser();
        return userRepository.findAll().stream()
                .filter(u -> roleFilter == null || u.getRole() == roleFilter)
                .sorted(Comparator.comparing(User::getId))
                .map(u -> AdminUserResponse.fromEntity(u, reservationCounts.getOrDefault(u.getId(), 0L)))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // THE LOGGED-IN USER (used by the admin pages to show name/role and hide menus)
    // Any role that can open the admin area (incl. FINANCE_EXECUTIVE) may call this.
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AdminUserResponse getCurrentUser(Long actingUserId) {
        User user = adminAccessService.requireReportAccess(actingUserId);
        return AdminUserResponse.fromEntity(user, countReservations(user.getId()));
    }

    // ──────────────────────────────────────────────
    // 2. VIEW ONE ACCOUNT
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long actingUserId, Long id) {
        adminAccessService.requireAdmin(actingUserId);
        User user = findUser(id);
        return AdminUserResponse.fromEntity(user, countReservations(user.getId()));
    }

    // ──────────────────────────────────────────────
    // 3. CREATE A CUSTOMER OR STAFF ACCOUNT
    // ──────────────────────────────────────────────
    @Transactional
    public AdminUserResponse createUser(Long actingUserId, AdminUserRequest request) {
        User actor = adminAccessService.requireAdmin(actingUserId);

        if (request.getRole() == null) {
            throw new InvalidRequestException("Role is required.");
        }
        checkCanAssignRole(actor, request.getRole());

        String name = validateName(request.getName());
        String email = validateEmail(request.getEmail(), null);
        String password = validatePassword(request.getPassword());

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(request.getRole());

        User saved = userRepository.saveAndFlush(user);

        // createdAt is DB-generated (insertable = false). findById() would just return the
        // cached object, so refresh it from the database to get the real value.
        entityManager.refresh(saved);
        return AdminUserResponse.fromEntity(saved, 0);
    }

    // ──────────────────────────────────────────────
    // 4. UPDATE AN ACCOUNT (only the fields that are sent)
    // ──────────────────────────────────────────────
    @Transactional
    public AdminUserResponse updateUser(Long actingUserId, Long id, AdminUserRequest request) {
        User actor = adminAccessService.requireAdmin(actingUserId);
        User user = findUser(id);
        checkCanManage(actor, user);

        if (request.getName() != null) {
            user.setName(validateName(request.getName()));
        }
        if (request.getEmail() != null) {
            user.setEmail(validateEmail(request.getEmail(), user.getId()));
        }
        if (request.getPassword() != null) {
            user.setPasswordHash(passwordEncoder.encode(validatePassword(request.getPassword())));
        }
        if (request.getRole() != null && request.getRole() != user.getRole()) {
            applyRoleChange(actor, user, request.getRole());
        }

        User saved = userRepository.save(user);
        return AdminUserResponse.fromEntity(saved, countReservations(saved.getId()));
    }

    // ──────────────────────────────────────────────
    // 5. CHANGE AN ACCOUNT'S ROLE
    // ──────────────────────────────────────────────
    @Transactional
    public AdminUserResponse changeRole(Long actingUserId, Long id, Role newRole) {
        User actor = adminAccessService.requireAdmin(actingUserId);
        User user = findUser(id);
        checkCanManage(actor, user);

        if (newRole == null) {
            throw new InvalidRequestException("Role is required.");
        }
        applyRoleChange(actor, user, newRole);

        User saved = userRepository.save(user);
        return AdminUserResponse.fromEntity(saved, countReservations(saved.getId()));
    }

    // ──────────────────────────────────────────────
    // 6. DELETE AN ACCOUNT
    // ──────────────────────────────────────────────
    @Transactional
    public void deleteUser(Long actingUserId, Long id) {
        User actor = adminAccessService.requireAdmin(actingUserId);
        User user = findUser(id);
        checkCanManage(actor, user);

        if (actor.getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You cannot delete your own account.");
        }

        long reservations = countReservations(user.getId());
        if (reservations > 0) {
            throw new InvalidRequestException("Cannot delete " + user.getEmail() + " because the account has "
                    + reservations + " reservation(s). Accounts with booking history must be kept.");
        }

        userRepository.delete(user);
    }

    // ──────────────────────────────────────────────
    // HELPERS: authorization rules (extension 10a)
    // ──────────────────────────────────────────────
    private void checkCanManage(User actor, User target) {
        if (target.getRole() == Role.SYSTEM_ADMIN && actor.getRole() != Role.SYSTEM_ADMIN) {
            throw new UnauthorizedAccessException("Only a System Administrator can modify a System Administrator account.");
        }
    }

    private void checkCanAssignRole(User actor, Role role) {
        if (role == Role.SYSTEM_ADMIN && actor.getRole() != Role.SYSTEM_ADMIN) {
            throw new UnauthorizedAccessException("Only a System Administrator can assign the SYSTEM_ADMIN role.");
        }
    }

    private void applyRoleChange(User actor, User target, Role newRole) {
        if (actor.getId().equals(target.getId()) && newRole != target.getRole()) {
            throw new UnauthorizedAccessException("You cannot change your own role.");
        }
        checkCanAssignRole(actor, newRole);
        target.setRole(newRole);
    }

    // ──────────────────────────────────────────────
    // HELPERS: validation
    // ──────────────────────────────────────────────
    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new InvalidRequestException("Name is required.");
        }
        String trimmed = name.trim();
        if (trimmed.length() > 100) {
            throw new InvalidRequestException("Name must be 100 characters or fewer.");
        }
        return trimmed;
    }

    private String validateEmail(String email, Long currentUserId) {
        if (email == null || email.isBlank()) {
            throw new InvalidRequestException("Email is required.");
        }
        String normalized = email.trim().toLowerCase();
        if (normalized.length() > 150 || !EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new InvalidRequestException("Email address '" + email + "' is not valid.");
        }

        boolean taken = userRepository.findAll().stream()
                .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(normalized));
        if (taken) {
            throw new InvalidRequestException("An account with email " + normalized + " already exists.");
        }
        return normalized;
    }

    private String validatePassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new InvalidRequestException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
        }
        return password;
    }

    // ──────────────────────────────────────────────
    // HELPERS: lookups
    // ──────────────────────────────────────────────
    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private Map<Long, Long> reservationCountsByUser() {
        return reservationRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getUser().getId(), Collectors.counting()));
    }

    private long countReservations(Long userId) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getUser().getId().equals(userId))
                .count();
    }
}

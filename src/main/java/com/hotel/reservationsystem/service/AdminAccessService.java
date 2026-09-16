package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.exception.UnauthorizedAccessException;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Set;

/**
 * UC-06 extension 1a: decides who may use the administration functions.
 *
 * Login/JWT (UC-01) isn't finished yet and SecurityConfig currently permits every
 * request, so the admin controllers identify the logged-in user with an
 * "X-User-Id" request header. When UC-01 is done, only this class needs to change
 * to read the user from the Spring Security context instead.
 */
@Service
public class AdminAccessService {

    // Full administration: dashboard, reports, user accounts, system settings
    public static final Set<Role> ADMIN_ROLES = EnumSet.of(Role.HOTEL_MANAGER, Role.SYSTEM_ADMIN);

    // Dashboard and reports only (US-19: Finance & Operations Executive generates revenue reports)
    public static final Set<Role> REPORT_ROLES = EnumSet.of(Role.HOTEL_MANAGER, Role.SYSTEM_ADMIN, Role.FINANCE_EXECUTIVE);

    @Autowired
    private UserRepository userRepository;

    public User requireAdmin(Long userId) {
        return requireAnyRole(userId, ADMIN_ROLES);
    }

    public User requireReportAccess(Long userId) {
        return requireAnyRole(userId, REPORT_ROLES);
    }

    private User requireAnyRole(Long userId, Set<Role> allowedRoles) {
        if (userId == null) {
            throw new UnauthorizedAccessException(
                    "You must be logged in to use administration functions (missing X-User-Id header).");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedAccessException("Logged-in user not found with id: " + userId));

        if (!allowedRoles.contains(user.getRole())) {
            throw new UnauthorizedAccessException(
                    "Access denied. Role " + user.getRole() + " does not have administrator privileges for this function.");
        }
        return user;
    }
}

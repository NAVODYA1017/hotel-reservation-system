package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.exception.AuthenticationFailedException;
import com.hotel.reservationsystem.exception.UnauthorizedAccessException;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Set;

/**
 * UC-06 extension 1a: decides who may use the administration functions.
 *
 * The controllers get the signed-in user's id from the session token (AdminAuthService),
 * then every service method calls requireAdmin / requireReportAccess. The role is read
 * from the database on each request, so a role change or deleted account takes effect immediately.
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
            throw new AuthenticationFailedException("Please sign in to use administration functions.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationFailedException("Your account no longer exists. Please sign in again."));

        if (!allowedRoles.contains(user.getRole())) {
            throw new UnauthorizedAccessException(
                    "Access denied. Role " + user.getRole() + " does not have administrator privileges for this function.");
        }
        return user;
    }
}

package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.AdminUserRequest;
import com.hotel.reservationsystem.dto.AdminUserResponse;
import com.hotel.reservationsystem.dto.RoleUpdateRequest;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.service.AdminUserService;
import com.hotel.reservationsystem.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UC-06 "Manage Users & Roles".
 * Every request must send the sign-in token as "Authorization: Bearer <token>"
 * (see AdminAuthService). Role checks happen in AdminAccessService. Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private AdminUserService adminUserService;

    // GET http://localhost:8080/api/admin/users
    // GET http://localhost:8080/api/admin/users?role=RECEPTIONIST
    @GetMapping
    public List<AdminUserResponse> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authorization,
                                               @RequestParam(required = false) Role role) {
        return adminUserService.getAllUsers(adminAuthService.currentUserId(authorization), role);
    }

    // GET http://localhost:8080/api/admin/users/me  (who is logged in - used by the admin pages)
    @GetMapping("/me")
    public AdminUserResponse getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return adminUserService.getCurrentUser(adminAuthService.currentUserId(authorization));
    }

    // GET http://localhost:8080/api/admin/users/2
    @GetMapping("/{id:\\d+}")
    public AdminUserResponse getUser(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @PathVariable Long id) {
        return adminUserService.getUserById(adminAuthService.currentUserId(authorization), id);
    }

    // POST http://localhost:8080/api/admin/users
    @PostMapping
    public ResponseEntity<AdminUserResponse> createUser(@RequestHeader(value = "Authorization", required = false) String authorization,
                                                        @RequestBody AdminUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(adminAuthService.currentUserId(authorization), request));
    }

    // PUT http://localhost:8080/api/admin/users/2
    @PutMapping("/{id}")
    public AdminUserResponse updateUser(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @PathVariable Long id,
                                        @RequestBody AdminUserRequest request) {
        return adminUserService.updateUser(adminAuthService.currentUserId(authorization), id, request);
    }

    // PUT http://localhost:8080/api/admin/users/2/role
    @PutMapping("/{id}/role")
    public AdminUserResponse changeRole(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @PathVariable Long id,
                                        @RequestBody RoleUpdateRequest request) {
        return adminUserService.changeRole(adminAuthService.currentUserId(authorization), id, request.getRole());
    }

    // DELETE http://localhost:8080/api/admin/users/2
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@RequestHeader(value = "Authorization", required = false) String authorization,
                                             @PathVariable Long id) {
        adminUserService.deleteUser(adminAuthService.currentUserId(authorization), id);
        return ResponseEntity.ok("User deleted successfully");
    }
}

package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.AdminUserRequest;
import com.hotel.reservationsystem.dto.AdminUserResponse;
import com.hotel.reservationsystem.dto.RoleUpdateRequest;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UC-06 "Manage Users & Roles".
 * Every request must send the logged-in user's id in the "X-User-Id" header
 * (see AdminAccessService). Allowed roles: HOTEL_MANAGER, SYSTEM_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    // GET http://localhost:8080/api/admin/users
    // GET http://localhost:8080/api/admin/users?role=RECEPTIONIST
    @GetMapping
    public List<AdminUserResponse> getAllUsers(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @RequestParam(required = false) Role role) {
        return adminUserService.getAllUsers(userId, role);
    }

    // GET http://localhost:8080/api/admin/users/me  (who is logged in - used by the admin pages)
    @GetMapping("/me")
    public AdminUserResponse getCurrentUser(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return adminUserService.getCurrentUser(userId);
    }

    // GET http://localhost:8080/api/admin/users/2
    @GetMapping("/{id:\\d+}")
    public AdminUserResponse getUser(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                     @PathVariable Long id) {
        return adminUserService.getUserById(userId, id);
    }

    // POST http://localhost:8080/api/admin/users
    @PostMapping
    public ResponseEntity<AdminUserResponse> createUser(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                        @RequestBody AdminUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(userId, request));
    }

    // PUT http://localhost:8080/api/admin/users/2
    @PutMapping("/{id}")
    public AdminUserResponse updateUser(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @PathVariable Long id,
                                        @RequestBody AdminUserRequest request) {
        return adminUserService.updateUser(userId, id, request);
    }

    // PUT http://localhost:8080/api/admin/users/2/role
    @PutMapping("/{id}/role")
    public AdminUserResponse changeRole(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @PathVariable Long id,
                                        @RequestBody RoleUpdateRequest request) {
        return adminUserService.changeRole(userId, id, request.getRole());
    }

    // DELETE http://localhost:8080/api/admin/users/2
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                             @PathVariable Long id) {
        adminUserService.deleteUser(userId, id);
        return ResponseEntity.ok("User deleted successfully");
    }
}

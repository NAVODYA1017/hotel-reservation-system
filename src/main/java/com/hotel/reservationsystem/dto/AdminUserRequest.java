package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.Role;
import lombok.Getter;
import lombok.Setter;

/**
 * What the admin sends to POST /api/admin/users (create a customer or staff account)
 * {
 *   "name": "Nimal Perera",
 *   "email": "nimal@hotel.com",
 *   "password": "Welcome@123",
 *   "role": "RECEPTIONIST"
 * }
 *
 * Also used by PUT /api/admin/users/{id} - there every field is optional and
 * only the fields you send are changed ("password" resets the password).
 */
@Getter
@Setter
public class AdminUserRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}

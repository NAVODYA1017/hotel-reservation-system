package com.hotel.reservationsystem.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * What the admin sign-in page sends to POST /api/admin/auth/login
 * {
 *   "email": "admin@hotel.com",
 *   "password": "********"
 * }
 */
@Getter
@Setter
public class AdminLoginRequest {
    private String email;
    private String password;
}

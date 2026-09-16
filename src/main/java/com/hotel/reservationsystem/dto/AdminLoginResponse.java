package com.hotel.reservationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * What POST /api/admin/auth/login sends back after a successful sign-in.
 * The browser sends the token on every admin request as:  Authorization: Bearer <token>
 */
@Getter
@Setter
@AllArgsConstructor
public class AdminLoginResponse {
    private String token;
    private LocalDateTime expiresAt;
    private AdminUserResponse user;
}

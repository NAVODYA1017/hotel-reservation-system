package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.Role;
import lombok.Getter;
import lombok.Setter;

/**
 * What the admin sends to PUT /api/admin/users/{id}/role
 * {
 *   "role": "EVENT_COORDINATOR"
 * }
 */
@Getter
@Setter
public class RoleUpdateRequest {
    private Role role;
}

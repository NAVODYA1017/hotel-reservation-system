package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * User account details shown to the administrator. Never includes the password hash.
 */
@Getter
@Setter
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean staff;
    private long reservationCount;
    private LocalDateTime createdAt;

    public static AdminUserResponse fromEntity(User user, long reservationCount) {
        AdminUserResponse res = new AdminUserResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole());
        res.setStaff(user.getRole() != Role.CUSTOMER);
        res.setReservationCount(reservationCount);
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }
}

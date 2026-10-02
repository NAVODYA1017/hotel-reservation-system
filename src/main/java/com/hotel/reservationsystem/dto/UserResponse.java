// ═══════════════════════════════════════════════════════════════════════
// FILE : UserResponse.java
// UC   : UC-01 – User Account Management (Teammate 1: Sandeepani H.G.K.)
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS THIS CLASS?
//   UserResponse is the data sent back to the client after registration,
//   login, or profile fetching.
//   SECURITY RULE: It NEVER contains the password hash!
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data                // Lombok: generates getters, setters, toString, equals, and hashCode.
@NoArgsConstructor   // Lombok: generates no-args default constructor.
@AllArgsConstructor  // Lombok: generates constructor with all fields.
@Builder             // Lombok: provides Builder pattern.
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private Role role;
    private LocalDateTime createdAt;
}

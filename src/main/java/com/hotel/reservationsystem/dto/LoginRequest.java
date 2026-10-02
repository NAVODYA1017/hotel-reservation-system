// ═══════════════════════════════════════════════════════════════════════
// FILE : LoginRequest.java
// UC   : UC-01 – User Account Management (Teammate 1: Sandeepani H.G.K.)
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS THIS CLASS?
//   This DTO captures the login credentials (email and password) sent by
//   a user to authenticate.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                // Lombok: generates getters, setters, toString, equals, and hashCode.
@NoArgsConstructor   // Lombok: generates no-args default constructor for Jackson.
@AllArgsConstructor  // Lombok: generates constructor with all fields.
@Builder             // Lombok: provides Builder pattern.
public class LoginRequest {
    private String email;
    private String password;
}

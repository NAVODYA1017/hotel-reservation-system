// ═══════════════════════════════════════════════════════════════════════
// FILE : RegisterRequest.java
// UC   : UC-01 – User Account Management (Teammate 1: Sandeepani H.G.K.)
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS THIS CLASS?
//   This DTO captures the registration form data sent from the client
//   when a user signs up.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                // Lombok: generates getters, setters, toString, equals, and hashCode.
@NoArgsConstructor   // Lombok: generates no-args default constructor (required for Jackson JSON deserialization).
@AllArgsConstructor  // Lombok: generates constructor with all fields.
@Builder             // Lombok: provides Builder pattern for object creation.
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
}

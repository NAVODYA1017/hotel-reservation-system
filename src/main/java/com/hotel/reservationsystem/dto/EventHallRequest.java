// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallRequest.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS A DTO?
//   Transfers client form data into the backend without directly exposing
//   the underlying JPA entity. Decouples the API contract from the DB schema.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;


import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data //getters, setters, equals...
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventHallRequest {

    @NotBlank(message = "Event hall name is required")
    @Size(max = 100, message = "Event hall name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @JsonAlias({"pricePerDay", "price"}) //JsonAlias - allow alternative names/ json field -> java obj
    private BigDecimal pricePerEvent;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @JsonAlias({"capacity"})
    private Integer seatingCapacity;


    private Boolean available;

    @JsonAlias({"amenities"})
    private String description;

    private String imageUrl;
}

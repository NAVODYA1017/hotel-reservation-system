// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageRequest.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT DOES THIS CLASS DO?
//   Captures the data submitted when creating or updating an event package.
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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageRequest {

    @NotBlank(message = "Package name is required")
    @Size(max = 100, message = "Package name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Package description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Package price is required")
    @DecimalMin(value = "0.01", message = "Package price must be greater than 0")
    private BigDecimal price;

    @NotBlank(message = "Services must be filled")
    @JsonAlias({"services", "services_included"})
    private String servicesIncluded;
}

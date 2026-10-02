// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageRequest.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT DOES THIS CLASS DO?
//   Captures the data submitted when creating or updating an event package.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// JsonAlias     – Accepts 'services' as an alias for 'servicesIncluded'.
// BigDecimal    – Monetary precision decimal for package cost.
// Lombok:
//   @Data       – Eliminates boilerplate getter/setter code.
//   @NoArgsConstructor, @AllArgsConstructor, @Builder – Constructor patterns.
// ─────────────────────────────────────────────────────────────────────────
import com.fasterxml.jackson.annotation.JsonAlias;
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

    // Package name, e.g. "Platinum Wedding Package"
    private String name;

    // Detailed description of the package bundle
    private String description;

    // Cost of the package – must be greater than zero (Extension 10a)
    private BigDecimal price;

    // Services included, e.g. "Catering, Decor, Photography, AV Setup"
    @JsonAlias({"services", "services_included"})
    private String servicesIncluded;
}

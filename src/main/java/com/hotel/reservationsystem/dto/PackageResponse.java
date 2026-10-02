// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageResponse.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: DTO (Data Transfer Object)
//
// WHAT DOES THIS CLASS DO?
//   Delivers formatted event package information to the frontend
//   and customer browsing catalog (Main Scenario Step 4 & 12).
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// Package        – The JPA Entity containing the persisted package record.
// BigDecimal     – High precision monetary value.
// Lombok:
//   @Data        – Auto-generates getters, setters, toString, equals, hashCode.
//   @Builder     – Builder pattern.
//   @NoArgsConstructor, @AllArgsConstructor – Standard constructors.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.Package;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String servicesIncluded;

    // ─────────────────────────────────────────────────────────────────
    // STATIC FACTORY MAPPER (Entity → Response DTO)
    // ─────────────────────────────────────────────────────────────────
    public static PackageResponse fromEntity(Package pkg) {
        if (pkg == null) return null;
        return PackageResponse.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .servicesIncluded(pkg.getServicesIncluded())
                .build();
    }
}

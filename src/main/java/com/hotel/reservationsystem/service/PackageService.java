// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageService.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: Service (Business Logic Layer)
//
// WHAT DOES THIS SERVICE DO?
//   Implements business rules and CRUD workflows for customizable event
//   packages (catering, decor, multimedia). Handles:
//     - Extension 10a: Price & incomplete package validation
//     - Extension 11a: Duplicate package prevention
//     - Open Issue 1: Reservation safety before package deletion
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.service;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// PackageRequest / Response   – DTOs for safe client-server data transfer.
// Package                     – JPA Entity mapping to "packages" table.
// PackageRepository           – Data access interface for package records.
// ReservationRepository       – Injected to check active reservations (Open Issue 1).
// ResourceNotFoundException   – Thrown when an ID does not exist in DB (404).
// @Service                    – Declares this class as a Spring Service Component.
// @Transactional              – Wraps database actions in transactional context.
// @Autowired                  – Dependency injection from Spring context.
// BigDecimal                  – High-precision currency calculations.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.PackageRequest;
import com.hotel.reservationsystem.dto.PackageResponse;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.PackageRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service // Spring Service Bean managed in ApplicationContext
public class PackageService {

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE EVENT PACKAGE – Main Scenario Steps 9, 10, 11
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public PackageResponse createPackage(PackageRequest request) {
        // Step 11 & Extension 10a: Validate package info and price
        validatePackageRequest(request);

        String pkgName = request.getName().trim();
        // Extension 11a: "If a package already exists, system prevents duplicate creation"
        if (packageRepository.existsByNameIgnoreCase(pkgName)) {
            throw new IllegalArgumentException("An event package with the name '" + pkgName + "' already exists.");
        }

        // Build JPA Entity
        Package pkg = new Package();
        pkg.setName(pkgName);
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setServicesIncluded(request.getServicesIncluded() != null ? request.getServicesIncluded().trim() : "");

        // Persist to MySQL database
        Package saved = packageRepository.save(pkg);
        return PackageResponse.fromEntity(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL EVENT PACKAGES – Main Scenario Step 4 & Step 12
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<PackageResponse> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET PACKAGE BY ID
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));
        return PackageResponse.fromEntity(pkg);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. UPDATE EVENT PACKAGE – Main Scenario Step 9
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        // Step 11 & Extension 10a: Validate input
        validatePackageRequest(request);

        Package existingPkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        String newName = request.getName().trim();
        // Extension 11a: Check if new name duplicates another package
        if (!newName.equalsIgnoreCase(existingPkg.getName()) && packageRepository.existsByNameIgnoreCase(newName)) {
            throw new IllegalArgumentException("An event package with the name '" + newName + "' already exists.");
        }

        existingPkg.setName(newName);
        existingPkg.setDescription(request.getDescription());
        existingPkg.setPrice(request.getPrice());
        existingPkg.setServicesIncluded(request.getServicesIncluded() != null ? request.getServicesIncluded().trim() : "");

        Package updated = packageRepository.save(existingPkg);
        return PackageResponse.fromEntity(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. DELETE EVENT PACKAGE – Open Issue 1
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void deletePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        // Open Issue 1: "The detailed rules for handling existing reservations when a hall or package is removed..."
        // Business Rule: Prevent deletion if any active or past reservation is using this package.
        boolean isLinkedToReservations = reservationRepository.existsByEventPackage_Id(id);
        if (isLinkedToReservations) {
            throw new IllegalStateException("Cannot delete Package '" + pkg.getName() + "' because it is linked to existing reservation records.");
        }

        packageRepository.delete(pkg);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Validate Package Request (Extension 10a)
    // ─────────────────────────────────────────────────────────────────
    private void validatePackageRequest(PackageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Package request cannot be null.");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Package name is required.");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid package price. Price must be greater than zero (Extension 10a).");
        }
        if (request.getServicesIncluded() == null || request.getServicesIncluded().trim().isEmpty()) {
            throw new IllegalArgumentException("Incomplete package information: services included must be specified (Extension 10a).");
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageController.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: Controller (Presentation / REST API Layer)
//
// WHAT DOES THIS CONTROLLER DO?
//   Exposes REST endpoints for managing event packages and services:
//     - POST   /api/packages     → Create a new event package (Step 9, 10, 11)
//     - GET    /api/packages     → List all event packages (Step 4 & 12)
//     - GET    /api/packages/{id}→ Get package by ID
//     - PUT    /api/packages/{id}→ Update package details (Step 9)
//     - DELETE /api/packages/{id}→ Delete package (Open Issue 1)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// PackageRequest / Response   – DTOs encapsulating package payloads.
// PackageService              – Injected service providing validation & CRUD.
// @RestController             – Marks class as Spring REST controller.
// @RequestMapping             – Directs requests matching /api/packages here.
// @CrossOrigin                – Enables cross-origin requests from Vite client.
// ResponseEntity              – Spring wrapper for HTTP response code, headers, body.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.PackageRequest;
import com.hotel.reservationsystem.dto.PackageResponse;
import com.hotel.reservationsystem.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE PACKAGE – Main Scenario Steps 9, 10, 11
    // POST http://localhost:8080/api/packages
    // ─────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(@RequestBody PackageRequest request) {
        PackageResponse response = packageService.createPackage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED); // 201 Created
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL PACKAGES – Main Scenario Steps 4 & 12
    // GET http://localhost:8080/api/packages
    // ─────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        List<PackageResponse> packages = packageService.getAllPackages();
        return ResponseEntity.ok(packages); // 200 OK
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET PACKAGE BY ID
    // GET http://localhost:8080/api/packages/1
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        PackageResponse pkg = packageService.getPackageById(id);
        return ResponseEntity.ok(pkg);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3B. GET PACKAGES FOR SPECIFIC HALL (UC-03 Page 8)
    // GET http://localhost:8080/api/packages/hall/1
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/hall/{hallId}")
    public ResponseEntity<List<PackageResponse>> getPackagesByHall(@PathVariable Long hallId) {
        List<PackageResponse> packages = packageService.getAllPackages();
        return ResponseEntity.ok(packages);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. UPDATE PACKAGE – Main Scenario Step 9
    // PUT http://localhost:8080/api/packages/1
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @RequestBody PackageRequest request) {
        PackageResponse updated = packageService.updatePackage(id, request);
        return ResponseEntity.ok(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. DELETE PACKAGE – Open Issue 1
    // DELETE http://localhost:8080/api/packages/1
    // ─────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : PackageController.java
// LAYER: Controller (Presentation / REST API Layer)
//
// WHAT DOES THIS CONTROLLER DO?
//   Exposes REST endpoints for managing event packages and services:
//     - POST   /api/packages     → Create a new event package
//     - GET    /api/packages     → List all event packages
//     - GET    /api/packages/{id}→ Get package by ID
//     - PUT    /api/packages/{id}→ Update package details
//     - DELETE /api/packages/{id}→ Delete package
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

    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(@RequestBody PackageRequest request) {
        PackageResponse response = packageService.createPackage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED); // 201 Created
    }


    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        List<PackageResponse> packages = packageService.getAllPackages();
        return ResponseEntity.ok(packages); // 200 OK
    }


    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        PackageResponse pkg = packageService.getPackageById(id);
        return ResponseEntity.ok(pkg);
    }

    // error check --> gets all halls not just the related halls
    @GetMapping("/hall/{hallId}")
    public ResponseEntity<List<PackageResponse>> getPackagesByHall(@PathVariable Long hallId) {
        List<PackageResponse> packages = packageService.getAllPackages();
        return ResponseEntity.ok(packages);
    }


    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @RequestBody PackageRequest request) {
        PackageResponse updated = packageService.updatePackage(id, request);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}

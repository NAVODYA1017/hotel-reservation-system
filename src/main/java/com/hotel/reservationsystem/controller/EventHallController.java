// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallController.java
// UC   : UC-03 – Manage Event Halls and Packages
// LAYER: Controller (REST API layer – receives HTTP requests and returns
//        JSON responses to the React frontend)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// EventHall           – JPA entity that maps to the "event_halls" table in MySQL.
// Package             – JPA entity that maps to the "packages" table in MySQL.
//                       (Catering, decor, multimedia packages tied to a hall.)
// EventHallRepository – Spring Data JPA interface providing CRUD for event_halls.
// PackageRepository   – Spring Data JPA interface providing CRUD for packages.
// @Autowired          – Spring DI annotation – injects the repository instance.
// ResponseEntity      – Wraps the response body + HTTP status code + headers.
// HttpStatus          – Enum of standard HTTP status codes.
// List                – Java Collections interface for ordered lists.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.repository.EventHallRepository;
import com.hotel.reservationsystem.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController – marks this class as a REST controller.
//   → All methods return JSON data (not HTML views).
@RestController

// @RequestMapping("/api/event-halls") – base URL for all event hall endpoints.
@RequestMapping("/api/event-halls")
public class EventHallController {

    // Inject the EventHallRepository bean – provides CRUD operations for event_halls table.
    @Autowired
    private EventHallRepository eventHallRepository;

    // Inject the PackageRepository bean – provides CRUD operations for packages table.
    @Autowired
    private PackageRepository packageRepository;

    // ══════════════════════════════════════════════════════════════════════
    //  EVENT HALL CRUD OPERATIONS
    // ══════════════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────────────
    // 1. CREATE – Add a new event hall
    //    HTTP: POST http://localhost:8080/api/event-halls
    //    Body: { "name": "Grand Ballroom", "pricePerEvent": 250000.00,
    //            "seatingCapacity": 300, "available": true, "description": "..." }
    //    Response: 201 CREATED + saved event hall JSON
    // ──────────────────────────────────────────────────────────────────────
    @PostMapping  // Maps HTTP POST requests to this method
    public ResponseEntity<EventHall> createEventHall(@RequestBody EventHall eventHall) {
        // @RequestBody – Spring converts the incoming JSON body into an EventHall object.
        // eventHallRepository.save() – persists the new entity to the database.
        //   → Since the entity has no id, JPA performs an INSERT.
        EventHall savedHall = eventHallRepository.save(eventHall);
        // Return HTTP 201 Created with the saved entity (including auto-generated id).
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHall);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. READ ALL – Get all event halls
    //    HTTP: GET http://localhost:8080/api/event-halls
    //    Response: 200 OK + JSON array of all event halls
    // ──────────────────────────────────────────────────────────────────────
    @GetMapping  // Maps HTTP GET requests (no path suffix) to this method
    public List<EventHall> getAllEventHalls() {
        // findAll() – executes SELECT * FROM event_halls; returns all rows.
        return eventHallRepository.findAll();
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. READ ONE – Get a single event hall by id
    //    HTTP: GET http://localhost:8080/api/event-halls/1
    //    Response: 200 OK + event hall JSON, or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")  // {id} is extracted from the URL path
    public ResponseEntity<EventHall> getEventHallById(@PathVariable Long id) {
        // findById() → Optional<EventHall>. We map it to 200 OK or 404 Not Found.
        return eventHallRepository.findById(id)
                .map(ResponseEntity::ok)                        // If found → 200 OK
                .orElse(ResponseEntity.notFound().build());     // If not found → 404
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. UPDATE – Modify an existing event hall
    //    HTTP: PUT http://localhost:8080/api/event-halls/1
    //    Body: { "name": "Grand Ballroom", "pricePerEvent": 300000.00, ... }
    //    Response: 200 OK + updated event hall, or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")  // Maps HTTP PUT requests to /api/event-halls/{id}
    public ResponseEntity<EventHall> updateEventHall(@PathVariable Long id, @RequestBody EventHall hallDetails) {
        return eventHallRepository.findById(id)
                .map(existingHall -> {
                    // Copy each field from the request body to the existing entity.
                    existingHall.setName(hallDetails.getName());
                    existingHall.setPricePerEvent(hallDetails.getPricePerEvent());
                    existingHall.setSeatingCapacity(hallDetails.getSeatingCapacity());
                    existingHall.setAvailable(hallDetails.isAvailable());
                    existingHall.setDescription(hallDetails.getDescription());

                    // save() with an existing id → JPA performs UPDATE.
                    EventHall updatedHall = eventHallRepository.save(existingHall);
                    return ResponseEntity.ok(updatedHall);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. DELETE – Remove an event hall
    //    HTTP: DELETE http://localhost:8080/api/event-halls/1
    //    Response: 204 NO CONTENT (success), or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")  // Maps HTTP DELETE requests
    public ResponseEntity<Void> deleteEventHall(@PathVariable Long id) {
        if (eventHallRepository.existsById(id)) {
            // deleteById() → DELETE FROM event_halls WHERE id = ?;
            eventHallRepository.deleteById(id);
            // 204 No Content – resource deleted successfully, no body to return.
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PACKAGE CRUD OPERATIONS (packages belong to event halls)
    // ══════════════════════════════════════════════════════════════════════

    // ──────────────────────────────────────────────────────────────────────
    // 6. CREATE PACKAGE – Add a package for a specific hall
    //    HTTP: POST http://localhost:8080/api/event-halls/packages
    //    Body: { "name": "Wedding Essentials", "description": "...",
    //            "price": 500000.00, "servicesIncluded": "Catering, Decor, Sound" }
    //    Response: 201 CREATED + saved package JSON
    // ──────────────────────────────────────────────────────────────────────
    @PostMapping("/packages")
    public ResponseEntity<Package> createPackage(@RequestBody Package eventPackage) {
        Package savedPackage = packageRepository.save(eventPackage);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPackage);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 7. READ ALL PACKAGES
    //    HTTP: GET http://localhost:8080/api/event-halls/packages
    //    Response: 200 OK + JSON array of all packages
    // ──────────────────────────────────────────────────────────────────────
    @GetMapping("/packages")
    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    // ──────────────────────────────────────────────────────────────────────
    // 8. READ ONE PACKAGE
    //    HTTP: GET http://localhost:8080/api/event-halls/packages/1
    //    Response: 200 OK + package JSON, or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @GetMapping("/packages/{id}")
    public ResponseEntity<Package> getPackageById(@PathVariable Long id) {
        return packageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────────────────────────────
    // 9. UPDATE PACKAGE
    //    HTTP: PUT http://localhost:8080/api/event-halls/packages/1
    //    Body: { "name": "Premium Wedding", "price": 750000.00, ... }
    //    Response: 200 OK + updated package, or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @PutMapping("/packages/{id}")
    public ResponseEntity<Package> updatePackage(@PathVariable Long id, @RequestBody Package packageDetails) {
        return packageRepository.findById(id)
                .map(existingPkg -> {
                    existingPkg.setName(packageDetails.getName());
                    existingPkg.setDescription(packageDetails.getDescription());
                    existingPkg.setPrice(packageDetails.getPrice());
                    existingPkg.setServicesIncluded(packageDetails.getServicesIncluded());
                    Package updatedPkg = packageRepository.save(existingPkg);
                    return ResponseEntity.ok(updatedPkg);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ──────────────────────────────────────────────────────────────────────
    // 10. DELETE PACKAGE
    //     HTTP: DELETE http://localhost:8080/api/event-halls/packages/1
    //     Response: 204 NO CONTENT (success), or 404 if not found
    // ──────────────────────────────────────────────────────────────────────
    @DeleteMapping("/packages/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        if (packageRepository.existsById(id)) {
            packageRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE    : ReservationController.java
// USE CASE: UC-04 – Create and Manage Reservation
// ACTORS  : Primary: Customer | Secondary: Receptionist, Event Coordinator
// MEMBER  : Hettiarachchi K. N.
// REG NO  : IT25104004
// ROLE    : Presentation / REST Controller Layer
// ═══════════════════════════════════════════════════════════════════════
//
// ── VIVA ARCHITECTURE OVERVIEW ─────────────────────────────────────────
// This controller exposes RESTful HTTP endpoints for managing hotel and hall
// reservations. It acts as the contract boundary between the React frontend
// and Spring Boot service layer.
//
// ── ENDPOINTS SUMMARY ──────────────────────────────────────────────────
// • POST   /api/reservations            → Create new booking (Steps 1–11)
// • GET    /api/reservations            → List all bookings (Receptionist/Admin)
// • GET    /api/reservations/{id}       → Retrieve booking by ID
// • GET    /api/reservations/user/{uid} → Customer booking history (Step 12)
// • PUT    /api/reservations/{id}       → Modify dates/stay (Extension 12a)
// • PUT    /api/reservations/{id}/cancel→ Cancel booking (Extension 12b)
// • DELETE /api/reservations/{id}       → Hard delete booking
// ═══════════════════════════════════════════════════════════════════════

package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller exposing JSON API endpoints for UC-04: Reservation Management.
 * Annotated with @RestController so all method return values are automatically
 * serialized into JSON via Jackson and written to the HTTP response body.
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    // Dependency injection of business logic service layer
    @Autowired
    private ReservationService reservationService;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE RESERVATION – Main Scenario Steps 1–11
    // POST http://localhost:8080/api/reservations
    // Returns HTTP 201 Created on success with booking confirmation details.
    // ─────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.createReservation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL RESERVATIONS – Admin / Receptionist View
    // GET http://localhost:8080/api/reservations
    // Returns HTTP 200 OK with list of all hotel and hall reservations.
    // ─────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<ReservationResponse> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET ONE RESERVATION BY ID
    // GET http://localhost:8080/api/reservations/{id}
    // Returns HTTP 200 OK with specific reservation details.
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        ReservationResponse response = reservationService.getReservationById(id);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3B. GET ALL RESERVATIONS BY USER ID – Main Scenario Step 12
    // GET http://localhost:8080/api/reservations/user/{userId}
    // Customer views their personalized reservations under "My Reservations".
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByUserId(@PathVariable Long userId) {
        List<ReservationResponse> list = reservationService.getReservationsByUserId(userId);
        return ResponseEntity.ok(list);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. MODIFY RESERVATION – Extension 12a
    // PUT http://localhost:8080/api/reservations/{id}
    // Allows updating dates; triggers conflict validation & price re-calculation.
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> modifyReservation(
            @PathVariable Long id,
            @RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.modifyReservation(id, request);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. CANCEL RESERVATION – Extension 12b & Open Issue 1
    // PUT http://localhost:8080/api/reservations/{id}/cancel
    // Soft-cancels the reservation and immediately releases room/hall inventory.
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id) {
        ReservationResponse response = reservationService.cancelReservation(id);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. DELETE RESERVATION – CRUD Hard Delete
    // DELETE http://localhost:8080/api/reservations/{id}
    // Returns HTTP 204 No Content after deleting reservation and child rows.
    // ─────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}

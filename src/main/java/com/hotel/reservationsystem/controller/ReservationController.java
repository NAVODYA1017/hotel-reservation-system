package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    // ──────────────────────────────────────────────
    // POST http://localhost:8080/api/reservations
    // Create a new reservation
    // ──────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.createReservation(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ──────────────────────────────────────────────
    // GET http://localhost:8080/api/reservations
    // List all reservations
    // ──────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<ReservationResponse> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    // ──────────────────────────────────────────────
    // GET http://localhost:8080/api/reservations/5
    // View one reservation by ID
    // ──────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        ReservationResponse response = reservationService.getReservationById(id);
        return ResponseEntity.ok(response);
    }

    // ──────────────────────────────────────────────
    // PUT http://localhost:8080/api/reservations/5
    // Modify an existing reservation
    // ──────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> modifyReservation(@PathVariable Long id, @RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.modifyReservation(id, request);
        return ResponseEntity.ok(response);
    }

    // ──────────────────────────────────────────────
    // PUT http://localhost:8080/api/reservations/5/cancel
    // Cancel a reservation
    // ──────────────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id) {
        ReservationResponse response = reservationService.cancelReservation(id);
        return ResponseEntity.ok(response);
    }
}

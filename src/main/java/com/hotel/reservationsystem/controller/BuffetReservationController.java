package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.BuffetCheckInRequest;
import com.hotel.reservationsystem.dto.BuffetReservationRequest;
import com.hotel.reservationsystem.dto.BuffetSlotAvailabilityResponse;
import com.hotel.reservationsystem.entity.BuffetReservation;
import com.hotel.reservationsystem.entity.enums.MealSession;
import com.hotel.reservationsystem.service.BuffetReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/buffet")
public class BuffetReservationController {

    @Autowired
    private BuffetReservationService buffetReservationService;

    /**
     * Public endpoint: check slot capacity and real-time availability.
     * GET /api/buffet/availability?date=2026-10-06
     */
    @GetMapping("/availability")
    public ResponseEntity<List<BuffetSlotAvailabilityResponse>> getAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(buffetReservationService.checkAvailability(date));
    }

    /**
     * Public endpoint: customer books a buffet dining reservation.
     * POST /api/buffet/reserve
     */
    @PostMapping("/reserve")
    public ResponseEntity<BuffetReservation> reserveBuffet(@Valid @RequestBody BuffetReservationRequest request) {
        request.setBookedBy("CLIENT_WEBSITE");
        BuffetReservation reservation = buffetReservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * Public/Verification endpoint: look up a dining reservation by confirmation code.
     * GET /api/buffet/verify/{code}
     */
    @GetMapping("/verify/{code}")
    public ResponseEntity<BuffetReservation> verifyReservation(@PathVariable String code) {
        return ResponseEntity.ok(buffetReservationService.getByConfirmationCode(code));
    }

    /**
     * Front desk / Staff endpoint: list all buffet reservations with optional filters.
     * GET /api/buffet/admin/all?date=2026-10-06&session=LUNCH&search=smith
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<BuffetReservation>> getAllReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) MealSession session,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(buffetReservationService.getAll(date, session, search));
    }

    /**
     * Front desk endpoint: check in guest upon arrival at the restaurant.
     * POST /api/buffet/admin/check-in/{id}
     */
    @PostMapping("/admin/check-in/{id}")
    public ResponseEntity<BuffetReservation> checkInGuest(
            @PathVariable Long id,
            @RequestBody(required = false) BuffetCheckInRequest request) {
        return ResponseEntity.ok(buffetReservationService.checkInGuest(id, request));
    }

    /**
     * Front desk endpoint: walk-in booking directly created by receptionist.
     * POST /api/buffet/admin/walk-in
     */
    @PostMapping("/admin/walk-in")
    public ResponseEntity<BuffetReservation> createWalkIn(@Valid @RequestBody BuffetReservationRequest request) {
        request.setBookedBy("RECEPTIONIST_WALKIN");
        BuffetReservation reservation = buffetReservationService.createReservation(request);
        if (request.getTableNumber() != null && !request.getTableNumber().trim().isEmpty()) {
            BuffetCheckInRequest checkInReq = new BuffetCheckInRequest();
            checkInReq.setTableNumber(request.getTableNumber());
            reservation = buffetReservationService.checkInGuest(reservation.getId(), checkInReq);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * Front desk endpoint: cancel a buffet reservation.
     * POST /api/buffet/admin/cancel/{id}
     */
    @PostMapping("/admin/cancel/{id}")
    public ResponseEntity<BuffetReservation> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(buffetReservationService.cancelReservation(id));
    }

    /**
     * Customer or Front Desk: Process payment for a buffet dining reservation.
     * POST /api/buffet/payment
     */
    @PostMapping("/payment")
    public ResponseEntity<BuffetReservation> processPayment(
            @Valid @RequestBody com.hotel.reservationsystem.dto.BuffetPaymentRequest request) {
        return ResponseEntity.ok(buffetReservationService.processPayment(request));
    }

    /**
     * Staff/Admin Payment Management: List all buffet dining payments.
     * GET /api/buffet/payments
     */
    @GetMapping("/payments")
    public ResponseEntity<List<com.hotel.reservationsystem.dto.BuffetPaymentResponse>> getBuffetPayments() {
        return ResponseEntity.ok(buffetReservationService.getAllPayments());
    }
}

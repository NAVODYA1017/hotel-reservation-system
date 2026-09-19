package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.ApiResponse;
import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.RefundRequest;
import com.hotel.reservationsystem.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * REST surface consumed by the React "Payment & Billing" module.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Step 4-9: customer submits payment for a reservation. */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> makePayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment processed successfully.", response));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable Long paymentId) {
        return ResponseEntity.ok(ApiResponse.ok("Payment retrieved.", paymentService.getPaymentById(paymentId)));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.ok("Payments retrieved.",
                paymentService.getPaymentsForReservation(reservationId)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok("Payment history retrieved.",
                paymentService.getPaymentsForCustomer(customerId)));
    }

    /** Receptionist / Hotel Manager view of every payment in the system. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.ok("All payments retrieved.", paymentService.getAllPayments()));
    }

    /** Extension 10a: authorized staff issues a refund. */
    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refund(@Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Refund processed.", paymentService.refundPayment(request)));
    }
}

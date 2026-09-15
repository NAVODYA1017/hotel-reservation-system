package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.RefundRequest;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // POST http://localhost:8080/api/payments
    @PostMapping
    public ResponseEntity<PaymentResponse> makePayment(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.makePayment(
                request.getReservationId(),
                request.getAmount(),
                request.getMethod()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(PaymentResponse.fromEntity(payment));
    }

    // GET http://localhost:8080/api/payments/1
    @GetMapping("/{id}")
    public PaymentResponse getPayment(@PathVariable Long id) {
        return PaymentResponse.fromEntity(paymentService.getPaymentById(id));
    }

    // GET http://localhost:8080/api/payments/reservation/1
    @GetMapping("/reservation/{reservationId}")
    public PaymentResponse getPaymentByReservation(@PathVariable Long reservationId) {
        return PaymentResponse.fromEntity(paymentService.getPaymentByReservationId(reservationId));
    }

    // PUT http://localhost:8080/api/payments/1/refund
    @PutMapping("/{id}/refund")
    public PaymentResponse refundPayment(@PathVariable Long id,
                                         @RequestBody(required = false) RefundRequest request) {
        String reason = request != null ? request.getReason() : null;
        return PaymentResponse.fromEntity(paymentService.refundPayment(id, reason));

    }
}

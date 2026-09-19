package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.RefundRequest;

import java.util.List;

/**
 * UC-05 – Process Payment and Generate Invoice.
 */
public interface PaymentService {

    /** Main Scenario steps 4-9: validate, charge, record, update reservation, generate invoice. */
    PaymentResponse processPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);

    List<PaymentResponse> getPaymentsForReservation(Long reservationId);

    List<PaymentResponse> getPaymentsForCustomer(Long customerId);

    /** Staff/Admin view across the whole hotel (UC-06 also reads this for reporting). */
    List<PaymentResponse> getAllPayments();

    /** Extension 10a: authorized staff processes a refund. */
    PaymentResponse refundPayment(RefundRequest request);
}

package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.RefundRequest;
import com.hotel.reservationsystem.entity.Invoice;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.entity.enums.InvoiceStatus;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.exception.InvalidPaymentException;
import com.hotel.reservationsystem.exception.PaymentProcessingException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.InvoiceRepository;
import com.hotel.reservationsystem.repository.PaymentRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.hotel.reservationsystem.service.PaymentStrategyFactory.PaymentGatewayResult;
import com.hotel.reservationsystem.service.PaymentStrategyFactory.PaymentStrategy;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Owned by: Payment & Billing Management (Ranaweera R.A.Y.N. / IT25104079).
 *
 * Implements the Main Scenario end-to-end:
 *  3. amount payable is read from the reservation's balance due
 *  6. validation is delegated to the resolved {@link PaymentStrategy}
 *  7. the strategy "processes" the charge
 *  8. the payment + reservation balance are persisted
 *  9. an itemized invoice is generated via {@link InvoiceService}
 */
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final InvoiceService invoiceService;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with id: " + request.getReservationId()));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidPaymentException("Cannot pay for a cancelled reservation.");
        }
        if (reservation.getStatus() == ReservationStatus.PAID) {
            throw new InvalidPaymentException("This reservation has already been paid in full.");
        }

        BigDecimal balanceDue = reservation.getBalanceDue();
        if (request.getAmount().compareTo(balanceDue) > 0) {
            throw new InvalidPaymentException(
                    "Payment amount (" + request.getAmount() + ") exceeds the outstanding balance (" + balanceDue + ").");
        }

        // Strategy pattern: resolve the gateway for the chosen payment method.
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(request.getPaymentMethod());

        Payment payment = new Payment();
        payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setReservation(reservation);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());

        PaymentGatewayResult result;
        try {
            result = strategy.pay(request, request.getAmount());
        } catch (InvalidPaymentException ex) {
            // Validation errors (6a) are not persisted as failed attempts -
            // the customer hasn't been charged, they just mistyped a field.
            throw ex;
        }

        if (!result.success()) {
            // Extension 7a: record the failed attempt but do NOT touch the
            // reservation balance, and let the customer retry.
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(result.failureReason());
            paymentRepository.save(payment);
            throw new PaymentProcessingException(result.failureReason());
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentReferenceInfo(result.referenceInfo());
        Payment savedPayment = paymentRepository.save(payment);

        // Step 8: record the payment and update the payment status.
        reservation.setAmountPaid(reservation.getAmountPaid().add(request.getAmount()));
        if (reservation.getAmountPaid().compareTo(reservation.getTotalAmount()) >= 0) {
            reservation.setStatus(ReservationStatus.PAID);
        } else {
            reservation.setStatus(ReservationStatus.AWAITING_PAYMENT);
        }
        reservationRepository.save(reservation);

        // Step 9: generate an itemized invoice.
        Invoice invoice = invoiceService.generateInvoice(savedPayment);

        return toDto(savedPayment, invoice, reservation);
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = findPaymentOrThrow(paymentId);
        return toDto(payment, findInvoiceForPayment(payment), payment.getReservation());
    }

    @Override
    public List<PaymentResponse> getPaymentsForReservation(Long reservationId) {
        return paymentRepository.findByReservationIdOrderByPaidAtDesc(reservationId).stream()
                .map(p -> toDto(p, findInvoiceForPayment(p), p.getReservation()))
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsForCustomer(Long customerId) {
        return paymentRepository.findByReservation_Customer_IdOrderByPaidAtDesc(customerId).stream()
                .map(p -> toDto(p, findInvoiceForPayment(p), p.getReservation()))
                .toList();
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc().stream()
                .map(p -> toDto(p, findInvoiceForPayment(p), p.getReservation()))
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(RefundRequest request) {
        Payment payment = findPaymentOrThrow(request.getPaymentId());

        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new InvalidPaymentException("Only successful payments can be refunded.");
        }
        if (request.getRefundAmount().compareTo(payment.getAmount()) > 0) {
            throw new InvalidPaymentException("Refund amount cannot exceed the original payment amount.");
        }

        boolean fullRefund = request.getRefundAmount().compareTo(payment.getAmount()) == 0;
        payment.setStatus(fullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
        payment.setFailureReason("Refunded: " + request.getReason());
        paymentRepository.save(payment);

        Reservation reservation = payment.getReservation();
        reservation.setAmountPaid(reservation.getAmountPaid().subtract(request.getRefundAmount()));
        if (reservation.getStatus() == ReservationStatus.PAID) {
            reservation.setStatus(ReservationStatus.AWAITING_PAYMENT);
        }
        reservationRepository.save(reservation);

        invoiceRepository.findByPaymentId(payment.getId()).ifPresent(invoice -> {
            invoice.setStatus(InvoiceStatus.REFUNDED);
            invoiceRepository.save(invoice);
        });

        return toDto(payment, findInvoiceForPayment(payment), reservation);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private Payment findPaymentOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    private Invoice findInvoiceForPayment(Payment payment) {
        return invoiceRepository.findByPaymentId(payment.getId()).orElse(null);
    }

    private PaymentResponse toDto(Payment payment, Invoice invoice, Reservation reservation) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .transactionReference(payment.getTransactionReference())
                .reservationId(reservation.getId())
                .reservationConfirmationCode(reservation.getConfirmationCode())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .failureReason(payment.getFailureReason())
                .remainingBalance(reservation.getBalanceDue())
                .invoiceNumber(invoice != null ? invoice.getInvoiceNumber() : null)
                .paidAt(payment.getPaidAt())
                .build();
    }
}

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
 * Process Payment and Generate Invoice service implementation.
 *
 * Implements the payment processing lifecycle:
 *  - Reads amount payable from the reservation balance due
 *  - Delegates validation to the resolved PaymentStrategy
 *  - Processes the transaction charge
 *  - Persists payment and updates reservation status
 *  - Generates itemized invoice via InvoiceService
 */
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final com.hotel.reservationsystem.repository.BuffetReservationRepository buffetReservationRepository;
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

        return toDto(savedPayment, invoice);
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = findPaymentOrThrow(paymentId);
        return toDto(payment, findInvoiceForPayment(payment));
    }

    @Override
    public List<PaymentResponse> getPaymentsForReservation(Long reservationId) {
        return paymentRepository.findByReservationIdOrderByPaidAtDesc(reservationId).stream()
                .map(p -> toDto(p, findInvoiceForPayment(p)))
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsForCustomer(Long customerId) {
        return paymentRepository.findByReservation_User_IdOrderByPaidAtDesc(customerId).stream()
                .map(p -> toDto(p, findInvoiceForPayment(p)))
                .toList();
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByPaidAtDesc().stream()
                .map(p -> toDto(p, findInvoiceForPayment(p)))
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
        if (reservation != null) {
            reservation.setAmountPaid(reservation.getAmountPaid().subtract(request.getRefundAmount()));
            if (reservation.getStatus() == ReservationStatus.PAID) {
                reservation.setStatus(ReservationStatus.AWAITING_PAYMENT);
            }
            reservationRepository.save(reservation);
        } else if (payment.getBuffetReservation() != null) {
            var buffet = payment.getBuffetReservation();
            buffet.setAmountPaid(buffet.getAmountPaid().subtract(request.getRefundAmount()));
            if (buffet.getPaymentStatus() == com.hotel.reservationsystem.entity.enums.PaymentStatus.SUCCESS) {
                buffet.setPaymentStatus(com.hotel.reservationsystem.entity.enums.PaymentStatus.PENDING);
            }
            buffetReservationRepository.save(buffet);
        }

        invoiceRepository.findByPaymentId(payment.getId()).ifPresent(invoice -> {
            invoice.setStatus(InvoiceStatus.REFUNDED);
            invoiceRepository.save(invoice);
        });

        return toDto(payment, findInvoiceForPayment(payment));
    }

    @Override
    @Transactional
    public PaymentResponse updatePayment(Long paymentId, PaymentRequest request) {
        Payment payment = findPaymentOrThrow(paymentId);
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        Payment saved = paymentRepository.save(payment);
        return toDto(saved, findInvoiceForPayment(saved));
    }

    @Override
    @Transactional
    public void deletePayment(Long paymentId) {
        Payment payment = findPaymentOrThrow(paymentId);
        Invoice invoice = findInvoiceForPayment(payment);
        if (invoice != null) {
            invoiceRepository.delete(invoice);
        }
        paymentRepository.delete(payment);
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

    private PaymentResponse toDto(Payment payment, Invoice invoice) {
        Reservation reservation = payment.getReservation();
        var buffet = payment.getBuffetReservation();
        
        String bookingType = "OTHER";
        String roomNumber = null;
        String roomType = null;
        String hallName = null;
        String packageName = null;
        String customerName = null;
        String customerEmail = null;

        if (reservation != null) {
            if (reservation.getUser() != null) {
                customerName = reservation.getUser().getName();
                customerEmail = reservation.getUser().getEmail();
            }
            if (reservation.getRoom() != null) {
                bookingType = "ROOM";
                roomNumber = reservation.getRoom().getRoomNumber();
                roomType = reservation.getRoom().getRoomType();
            } else if (reservation.getHall() != null) {
                bookingType = "EVENT_HALL";
                hallName = reservation.getHall().getName();
                if (reservation.getEventPackage() != null) {
                    packageName = reservation.getEventPackage().getName();
                }
            }
        } else if (buffet != null) {
            bookingType = "BUFFET";
            customerName = buffet.getGuestName();
            customerEmail = buffet.getGuestEmail();
        }

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .transactionReference(payment.getTransactionReference())
                .reservationId(reservation != null ? reservation.getId() : null)
                .reservationConfirmationCode(reservation != null ? reservation.getConfirmationCode() : (buffet != null ? buffet.getConfirmationCode() : null))
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .failureReason(payment.getFailureReason())
                .remainingBalance(reservation != null ? reservation.getBalanceDue() : null)
                .invoiceNumber(invoice != null ? invoice.getInvoiceNumber() : null)
                .paidAt(payment.getPaidAt())
                .bookingType(bookingType)
                .roomNumber(roomNumber)
                .roomType(roomType)
                .hallName(hallName)
                .packageName(packageName)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .build();
    }
}

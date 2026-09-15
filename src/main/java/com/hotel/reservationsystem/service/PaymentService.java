package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.exception.PaymentProcessingException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.PaymentRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private InvoiceService invoiceService;

    /**
     * UC-05 main scenario:
     * 1. Validate the reservation exists and isn't cancelled or already paid
     * 2. Validate the amount matches what's owed
     * 3. Record the payment as SUCCESS
     * 4. Confirm the reservation
     * 5. Auto-generate the invoice
     */
    @Transactional
    public Payment makePayment(Long reservationId, BigDecimal amount, PaymentMethod method) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new PaymentProcessingException("Cannot pay for a cancelled reservation.");
        }

        paymentRepository.findByReservationId(reservationId).ifPresent(existing -> {
            throw new PaymentProcessingException("This reservation has already been paid for.");
        });

        if (method == null) {
            throw new PaymentProcessingException("Payment method is required.");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentProcessingException("Payment amount must be greater than zero.");
        }

        if (amount.compareTo(reservation.getTotalAmount()) != 0) {
            throw new PaymentProcessingException(
                    "Payment amount (" + amount + ") does not match the reservation total (" +
                            reservation.getTotalAmount() + ").");
        }

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(amount);
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        invoiceService.generateInvoice(savedPayment);

        return savedPayment;
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    public Payment getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for reservation id: " + reservationId));
    }

    /**
     * UC-05 extension 10a: authorized staff/admin processes a refund request.
     * Marks the payment as REFUNDED and cancels the underlying reservation.
     */
    @Transactional
    public Payment refundPayment(Long id, String reason) {
        Payment payment = getPaymentById(id);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentProcessingException("Only a successful payment can be refunded.");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        Payment refunded = paymentRepository.save(payment);

        Reservation reservation = payment.getReservation();
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        return refunded;
    }
}


package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * UC-05 – Process Payment and Generate Invoice.
 */
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionReference(String transactionReference);

    List<Payment> findByReservationIdOrderByPaidAtDesc(Long reservationId);

    List<Payment> findByReservation_Customer_IdOrderByPaidAtDesc(Long customerId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findAllByOrderByPaidAtDesc();
}

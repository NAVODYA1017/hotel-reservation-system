// ═══════════════════════════════════════════════════════════════════════
// FILE : PaymentRepository.java
// UC   : UC-05 – Process Payment and Generate Invoice
// LAYER: Repository (Data Access Layer)
//
// Extends JpaRepository with CUSTOM query methods.
// Spring Data JPA generates the SQL from the method name automatically:
//   findBy<Field>  → WHERE field = ?
//   OrderBy<Field>Desc → ORDER BY field DESC
//   <Entity>_<Field>_<NestedField> → navigates JPA relationships
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Payment;              // Entity this repo manages.
import com.hotel.reservationsystem.entity.enums.PaymentStatus;  // For filtering by status.
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // findByTransactionReference → SELECT * FROM payments WHERE transaction_reference = ?
    Optional<Payment> findByTransactionReference(String transactionReference);

    // findByReservationIdOrderByPaidAtDesc →
    //   SELECT * FROM payments WHERE reservation_id = ? ORDER BY paid_at DESC
    //   Returns all payments for a specific reservation, newest first.
    List<Payment> findByReservationIdOrderByPaidAtDesc(Long reservationId);

    // findByReservation_User_IdOrderByPaidAtDesc →
    //   Navigates the relationship: Payment → Reservation → User → id
    //   SELECT * FROM payments p JOIN reservations r ON p.reservation_id = r.id
    //   WHERE r.user_id = ? ORDER BY p.paid_at DESC
    //   Returns all payments by a specific customer, newest first.
    List<Payment> findByReservation_User_IdOrderByPaidAtDesc(Long customerId);

    // findByStatus → SELECT * FROM payments WHERE status = ?
    List<Payment> findByStatus(PaymentStatus status);

    // findAllByOrderByPaidAtDesc → SELECT * FROM payments ORDER BY paid_at DESC
    //   Returns ALL payments in the system, newest first (for admin view).
    List<Payment> findAllByOrderByPaidAtDesc();
}

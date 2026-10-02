// ═══════════════════════════════════════════════════════════════════════
// FILE : InvoiceRepository.java
// UC   : UC-05 – Process Payment and Generate Invoice
// LAYER: Repository (Data Access Layer)
//
// Custom query methods – Spring Data JPA generates the SQL automatically
// from the method name.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Invoice;  // Entity this repo manages.
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // findByInvoiceNumber → SELECT * FROM invoices WHERE invoice_number = ?
    //   Used to look up an invoice by its unique invoice number string.
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    // findByPaymentId → SELECT * FROM invoices WHERE payment_id = ?
    //   Used to find the invoice generated for a specific payment.
    Optional<Invoice> findByPaymentId(Long paymentId);

    // findByReservationIdOrderByIssuedAtDesc →
    //   SELECT * FROM invoices WHERE reservation_id = ? ORDER BY issued_at DESC
    //   Returns all invoices for a reservation, newest first.
    List<Invoice> findByReservationIdOrderByIssuedAtDesc(Long reservationId);

    // findByReservation_User_IdOrderByIssuedAtDesc →
    //   Navigates: Invoice → Reservation → User → id
    //   Returns all invoices for a specific customer, newest first.
    List<Invoice> findByReservation_User_IdOrderByIssuedAtDesc(Long customerId);
}

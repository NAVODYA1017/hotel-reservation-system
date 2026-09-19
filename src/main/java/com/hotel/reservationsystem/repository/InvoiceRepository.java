package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * UC-05 – Process Payment and Generate Invoice.
 */
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByPaymentId(Long paymentId);

    List<Invoice> findByReservationIdOrderByIssuedAtDesc(Long reservationId);

    List<Invoice> findByReservation_Customer_IdOrderByIssuedAtDesc(Long customerId);
}

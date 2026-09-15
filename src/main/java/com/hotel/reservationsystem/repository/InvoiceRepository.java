package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByPaymentId(Long paymentId);

    // Used to work out the next sequence number for today's invoice numbers (INV-20260914-001, -002, ...)
    long countByInvoiceNumberStartingWith(String prefix);
}
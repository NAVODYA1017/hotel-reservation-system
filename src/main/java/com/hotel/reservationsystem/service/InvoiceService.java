package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.entity.Invoice;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * Called by PaymentService right after a payment is recorded as SUCCESS.
     * Generates a unique invoice number in the format INV-yyyyMMdd-001.
     */
    public Invoice generateInvoice(Payment payment) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "INV-" + datePart + "-";

        long countToday = invoiceRepository.countByInvoiceNumberStartingWith(prefix);
        String sequence = String.format("%03d", countToday + 1);
        String invoiceNumber = prefix + sequence;

        Invoice invoice = new Invoice();
        invoice.setPayment(payment);
        invoice.setInvoiceNumber(invoiceNumber);

        Invoice saved = invoiceRepository.save(invoice);

        // issuedAt is DB-generated (insertable = false), so re-fetch to get its real value
        return invoiceRepository.findById(saved.getId()).orElse(saved);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    public Invoice getInvoiceByPaymentId(Long paymentId) {
        return invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("No invoice found for payment id: " + paymentId));
    }
}

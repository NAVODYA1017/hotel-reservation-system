package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.InvoiceResponse;
import com.hotel.reservationsystem.entity.Invoice;
import com.hotel.reservationsystem.entity.Payment;

import java.util.List;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Main Scenario step 9: "System generates an itemized invoice."
 * Extension: step 11, "Customer views or downloads the invoice."
 */
public interface InvoiceService {

    /** Called by PaymentServiceImpl immediately after a payment succeeds. */
    Invoice generateInvoice(Payment payment);

    InvoiceResponse getInvoiceByNumber(String invoiceNumber);

    List<InvoiceResponse> getInvoicesForReservation(Long reservationId);

    List<InvoiceResponse> getInvoicesForCustomer(Long customerId);

    /** Renders a printable PDF for "View/Download Invoice". */
    byte[] generateInvoicePdf(String invoiceNumber);
}

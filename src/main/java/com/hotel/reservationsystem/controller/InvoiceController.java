package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.ApiResponse;
import com.hotel.reservationsystem.dto.InvoiceResponse;
import com.hotel.reservationsystem.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Step 11: "Customer views or downloads the invoice."
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/{invoiceNumber}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Invoice retrieved.", invoiceService.getInvoiceByNumber(invoiceNumber)));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getForReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.ok("Invoices retrieved.",
                invoiceService.getInvoicesForReservation(reservationId)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getForCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok("Invoices retrieved.",
                invoiceService.getInvoicesForCustomer(customerId)));
    }

    @GetMapping("/{invoiceNumber}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable String invoiceNumber) {
        byte[] pdf = invoiceService.generateInvoicePdf(invoiceNumber);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + invoiceNumber + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

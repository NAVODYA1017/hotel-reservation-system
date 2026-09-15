package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.InvoiceResponse;
import com.hotel.reservationsystem.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // GET http://localhost:8080/api/invoices/1
    @GetMapping("/{id}")
    public InvoiceResponse getInvoice(@PathVariable Long id) {
        return InvoiceResponse.fromEntity(invoiceService.getInvoiceById(id));
    }

    // GET http://localhost:8080/api/invoices/payment/1
    @GetMapping("/payment/{paymentId}")
    public InvoiceResponse getInvoiceByPayment(@PathVariable Long paymentId) {
        return InvoiceResponse.fromEntity(invoiceService.getInvoiceByPaymentId(paymentId));
    }
}


package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.Invoice;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private LocalDateTime issuedAt;
    private Long paymentId;
    private Long reservationId;
    private String customerName;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;

    public static InvoiceResponse fromEntity(Invoice invoice) {
        InvoiceResponse res = new InvoiceResponse();
        res.setId(invoice.getId());
        res.setInvoiceNumber(invoice.getInvoiceNumber());
        res.setIssuedAt(invoice.getIssuedAt());
        res.setPaymentId(invoice.getPayment().getId());
        res.setReservationId(invoice.getPayment().getReservation().getId());
        res.setCustomerName(invoice.getPayment().getReservation().getUser().getName());
        res.setAmount(invoice.getPayment().getAmount());
        res.setMethod(invoice.getPayment().getMethod());
        res.setStatus(invoice.getPayment().getStatus());
        return res;

    }
}

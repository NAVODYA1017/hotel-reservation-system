package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long invoiceId;
    private String invoiceNumber;
    private Long reservationId;
    private String reservationConfirmationCode;
    private String customerName;
    private String customerEmail;
    private List<InvoiceItem> items;
    private BigDecimal subTotal;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private InvoiceStatus status;
    private LocalDateTime issuedAt;
}

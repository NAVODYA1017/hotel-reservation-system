package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.BuffetReservation;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuffetPaymentResponse {
    private Long id;
    private String transactionRef;
    private String confirmationCode;
    private String guestName;
    private String mealSession;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private String type; // "BUFFET"

    public static BuffetPaymentResponse fromEntity(BuffetReservation r) {
        return BuffetPaymentResponse.builder()
                .id(r.getId())
                .transactionRef(r.getTransactionReference() != null ? r.getTransactionReference() : "TXN-BUF-" + r.getConfirmationCode())
                .confirmationCode(r.getConfirmationCode())
                .guestName(r.getGuestName())
                .mealSession(r.getMealSession() != null ? r.getMealSession().name() : "BUFFET")
                .amount(r.getAmountPaid() != null && r.getAmountPaid().compareTo(BigDecimal.ZERO) > 0 ? r.getAmountPaid() : r.getTotalAmount())
                .paymentMethod(r.getPaymentMethod() != null ? r.getPaymentMethod() : PaymentMethod.CREDIT_CARD)
                .status(r.getPaymentStatus() != null ? r.getPaymentStatus() : PaymentStatus.PENDING)
                .paidAt(r.getPaidAt() != null ? r.getPaidAt() : r.getCreatedAt())
                .type("BUFFET")
                .build();
    }
}

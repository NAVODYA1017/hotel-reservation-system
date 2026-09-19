package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
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
public class PaymentResponse {
    private Long paymentId;
    private String transactionReference;
    private Long reservationId;
    private String reservationConfirmationCode;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String failureReason;
    private BigDecimal remainingBalance;
    private String invoiceNumber;
    private LocalDateTime paidAt;

    /**
     * UC-06's ReportService reads revenue data through this factory
     * (PaymentResponse::fromEntity as a method reference). This DTO belongs
     * to UC-05, so the method lives here rather than in someone else's file.
     */
    public static PaymentResponse fromEntity(Payment payment) {
        Reservation reservation = payment.getReservation();
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .transactionReference(payment.getTransactionReference())
                .reservationId(reservation != null ? reservation.getId() : null)
                .reservationConfirmationCode(reservation != null ? reservation.getConfirmationCode() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getMethod())
                .status(payment.getStatus())
                .failureReason(payment.getFailureReason())
                .remainingBalance(reservation != null ? reservation.getBalanceDue() : null)
                .paidAt(payment.getPaidAt())
                .build();
    }
}

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

    // Detailed booking attribution fields
    private String bookingType; // "ROOM", "EVENT_HALL", "BUFFET"
    private String roomNumber;
    private String roomType;
    private String hallName;
    private String packageName;
    private String customerName;
    private String customerEmail;

    /**
     * UC-06's ReportService reads revenue data through this factory
     * (PaymentResponse::fromEntity as a method reference). This DTO belongs
     * to UC-05, so the method lives here rather than in someone else's file.
     */
    public static PaymentResponse fromEntity(Payment payment) {
        Reservation reservation = payment.getReservation();
        String bookingType = "OTHER";
        String roomNumber = null;
        String roomType = null;
        String hallName = null;
        String packageName = null;
        String customerName = null;
        String customerEmail = null;

        if (reservation != null) {
            if (reservation.getUser() != null) {
                customerName = reservation.getUser().getName();
                customerEmail = reservation.getUser().getEmail();
            }
            if (reservation.getRoom() != null) {
                bookingType = "ROOM";
                roomNumber = reservation.getRoom().getRoomNumber();
                roomType = reservation.getRoom().getRoomType();
            } else if (reservation.getHall() != null) {
                bookingType = "EVENT_HALL";
                hallName = reservation.getHall().getName();
                if (reservation.getEventPackage() != null) {
                    packageName = reservation.getEventPackage().getName();
                }
            }
        }

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
                .bookingType(bookingType)
                .roomNumber(roomNumber)
                .roomType(roomType)
                .hallName(hallName)
                .packageName(packageName)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .build();
    }
}

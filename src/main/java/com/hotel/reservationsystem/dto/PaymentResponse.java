package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private String customerName;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paidAt;

    public static PaymentResponse fromEntity(Payment payment) {
        PaymentResponse res = new PaymentResponse();
        res.setId(payment.getId());
        res.setReservationId(payment.getReservation().getId());
        res.setCustomerName(payment.getReservation().getUser().getName());
        res.setAmount(payment.getAmount());
        res.setMethod(payment.getMethod());
        res.setStatus(payment.getStatus());
        res.setPaidAt(payment.getPaidAt());
        return res;
    }
}

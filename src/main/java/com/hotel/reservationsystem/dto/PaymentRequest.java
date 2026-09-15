package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * What the browser sends to POST /api/payments
 * {
 *   "reservationId": 1,
 *   "amount": 15000.00,
 *   "method": "CARD"
 * }
 */
@Getter
@Setter
public class PaymentRequest {
    private Long reservationId;
    private BigDecimal amount;
    private PaymentMethod method;
}


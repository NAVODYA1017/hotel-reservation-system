package com.hotel.reservationsystem.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * What the browser sends to PUT /api/payments/{id}/refund (body is optional)
 * {
 *   "reason": "Event cancelled by customer"
 * }
 */

@Getter
@Setter
public class RefundRequest {
    private String reason;
}

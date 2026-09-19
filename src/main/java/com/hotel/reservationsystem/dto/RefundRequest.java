package com.hotel.reservationsystem.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * UC-05 Extension 10a: "If a refund is requested, the authorized
 * administrator handles the request according to the applicable rules."
 * Only Receptionist / Hotel Manager can call the refund endpoint.
 */
@Data
public class RefundRequest {

    @NotNull(message = "Payment id is required")
    private Long paymentId;

    @NotNull(message = "Refund amount is required")
    @DecimalMin(value = "0.01", message = "Refund amount must be greater than zero")
    private BigDecimal refundAmount;

    @NotBlank(message = "A reason must be provided for the refund")
    private String reason;
}

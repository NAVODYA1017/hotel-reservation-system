package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BuffetPaymentRequest {

    @NotBlank(message = "Confirmation code is required.")
    private String confirmationCode;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero.")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required.")
    private PaymentMethod paymentMethod;

    private String paymentReferenceInfo;
}

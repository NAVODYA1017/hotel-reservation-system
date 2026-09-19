package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * UC-05, Main Scenario step 5: "Customer enters payment information."
 * Card fields are optional and only validated when paymentMethod
 * is CREDIT_CARD or DEBIT_CARD (see PaymentServiceImpl / PaymentStrategyFactory.CardPaymentStrategy).
 */
@Data
public class PaymentRequest {

    @NotNull(message = "Reservation id is required")
    private Long reservationId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    // ---- Card payment fields (CREDIT_CARD / DEBIT_CARD) ----
    @Pattern(regexp = "^[0-9]{13,19}$", message = "Card number must be 13-19 digits")
    private String cardNumber;

    @Size(min = 2, max = 100)
    private String cardHolderName;

    @Pattern(regexp = "^(0[1-9]|1[0-2])/[0-9]{2}$", message = "Expiry must be in MM/YY format")
    private String cardExpiry;

    @Pattern(regexp = "^[0-9]{3,4}$", message = "CVV must be 3-4 digits")
    private String cvv;

    // ---- Bank transfer fields ----
    private String bankName;
    private String bankReferenceNumber;
}

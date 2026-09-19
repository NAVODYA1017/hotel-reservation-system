package com.hotel.reservationsystem.exception;

/**
 * UC-05 Extension 7a: "If the payment fails, the system does not mark
 * the payment as successful and allows the customer to retry."
 * Thrown by a PaymentStrategyFactory.PaymentStrategy when the (simulated) gateway declines
 * the transaction; the service layer catches this, records a FAILED
 * Payment row, and re-throws so the controller returns a clean 402.
 */
public class PaymentProcessingException extends RuntimeException {
    public PaymentProcessingException(String message) {
        super(message);
    }
}


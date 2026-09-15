package com.hotel.reservationsystem.exception;

/**
 * Thrown when a payment or refund request is invalid for business reasons
 * (wrong amount, reservation already paid, refunding a non-successful payment, etc.).
 * Mapped to HTTP 400 by GlobalExceptionHandler.
 */
public class PaymentProcessingException extends RuntimeException {
    public PaymentProcessingException(String message) {
        super(message);
    }
}


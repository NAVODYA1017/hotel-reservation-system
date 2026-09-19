package com.hotel.reservationsystem.exception;

/**
 * UC-05 Extension 6a: "If payment information is invalid, the system
 * displays an appropriate validation message."
 */
public class InvalidPaymentException extends RuntimeException {
    public InvalidPaymentException(String message) {
        super(message);
    }
}


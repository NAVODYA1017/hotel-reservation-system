package com.hotel.reservationsystem.exception;

/**
 * Thrown when an administration request fails validation (bad email, duplicate
 * account, invalid setting value, "from" date after "to" date, etc.).
 * Mapped to HTTP 400 by AdminExceptionHandler.
 */
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}

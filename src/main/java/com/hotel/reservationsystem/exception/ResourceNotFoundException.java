package com.hotel.reservationsystem.exception;

/**
 * Thrown when a lookup (by id, by reservation, by payment, etc.) finds nothing.
 * Mapped to HTTP 404 by GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

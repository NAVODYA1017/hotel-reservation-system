package com.hotel.reservationsystem.exception;

/**
 * UC-06 extensions 1a and 10a: thrown when the logged-in user does not have
 * administrator privileges, or tries an account operation they are not allowed
 * to perform (e.g. a Hotel Manager editing a System Administrator account).
 * Mapped to HTTP 403 by AdminExceptionHandler.
 */
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}

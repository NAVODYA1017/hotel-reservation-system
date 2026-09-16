package com.hotel.reservationsystem.exception;

/**
 * Thrown when the user is not signed in: wrong email/password, a missing or
 * expired session token, or too many failed sign-in attempts.
 * Mapped to HTTP 401 by AdminExceptionHandler (the pages then show the sign-in form).
 */
public class AuthenticationFailedException extends RuntimeException {
    public AuthenticationFailedException(String message) {
        super(message);
    }
}

package com.hotel.reservationsystem.exception;

/**
 * UC-06 extension 8a: thrown when a report cannot be generated because of an
 * unexpected failure (e.g. the database is unreachable). The administrator can
 * simply send the same request again to retry.
 * Mapped to HTTP 500 by AdminExceptionHandler.
 */
public class ReportGenerationException extends RuntimeException {
    public ReportGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}

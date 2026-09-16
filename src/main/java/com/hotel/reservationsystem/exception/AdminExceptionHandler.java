package com.hotel.reservationsystem.exception;

import com.hotel.reservationsystem.controller.AdminReportController;
import com.hotel.reservationsystem.controller.AdminUserController;
import com.hotel.reservationsystem.controller.SystemSettingsController;
import com.hotel.reservationsystem.dto.ErrorResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Error handling for the UC-06 administration controllers only.
 *
 * Kept separate from GlobalExceptionHandler so UC-06 doesn't edit another
 * module's file. It is limited to the admin controllers (assignableTypes) and
 * runs first (HIGHEST_PRECEDENCE) so GlobalExceptionHandler's catch-all
 * Exception handler doesn't swallow these. Anything not handled here (e.g.
 * ResourceNotFoundException) still falls through to GlobalExceptionHandler.
 */
@RestControllerAdvice(assignableTypes = {
        AdminReportController.class,
        AdminUserController.class,
        SystemSettingsController.class
})
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AdminExceptionHandler {

    // 1a / 10a - not an administrator, or operation not allowed for this role
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedAccessException ex) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(InvalidRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // 8a - report generation failed, admin can retry
    @ExceptionHandler(ReportGenerationException.class)
    public ResponseEntity<ErrorResponse> handleReportFailure(ReportGenerationException ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    // e.g. ?from=01-09-2026 instead of ?from=2026-09-01, ?role=MANAGER, or X-User-Id: abc
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String hint = ex.getRequiredType() == LocalDate.class ? " Dates must use the format yyyy-MM-dd." : "";
        return build(HttpStatus.BAD_REQUEST, "Invalid value '" + ex.getValue() + "' for '" + ex.getName() + "'." + hint);
    }

    // missing/malformed JSON body, or an unknown role name such as "MANAGER"
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST,
                "Request body is missing or malformed. Valid roles are: CUSTOMER, RECEPTIONIST, "
                        + "EVENT_COORDINATOR, HOTEL_MANAGER, SYSTEM_ADMIN, FINANCE_EXECUTIVE.");
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), message, LocalDateTime.now()));
    }
}

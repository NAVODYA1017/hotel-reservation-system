// ═══════════════════════════════════════════════════════════════════════
// Enum: PaymentStatus – Lifecycle states of a payment (UC-05).
// Stored as STRING in the "status" column of the "payments" table.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum PaymentStatus {
    PENDING,              // Payment has been created but not yet processed.
    SUCCESS,              // Payment was processed successfully; money received.
    FAILED,               // Payment processing failed (e.g. card declined).
    REFUNDED,             // Full refund has been issued for this payment.
    PARTIALLY_REFUNDED    // Partial refund has been issued (some money returned).
}

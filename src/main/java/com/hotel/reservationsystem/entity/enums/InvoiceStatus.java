// ═══════════════════════════════════════════════════════════════════════
// Enum: InvoiceStatus – Lifecycle states of an invoice (UC-05).
// Stored as STRING in the "status" column of the "invoices" table.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum InvoiceStatus {
    ISSUED,      // Invoice has been generated and sent/available to the customer.
    PAID,        // Invoice has been fully paid (used for record-keeping).
    CANCELLED,   // Invoice was cancelled (e.g. reservation was cancelled before payment).
    REFUNDED     // Payment associated with this invoice was refunded.
}

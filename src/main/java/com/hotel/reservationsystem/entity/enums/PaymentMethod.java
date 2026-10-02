// ═══════════════════════════════════════════════════════════════════════
// Enum: PaymentMethod – Supported payment methods (UC-05).
// Each value maps to a PaymentStrategy implementation in PaymentStrategyFactory.
// This is part of the Strategy Design Pattern.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity.enums;

public enum PaymentMethod {
    CREDIT_CARD,     // Processed by CardPaymentStrategy (validates card number, expiry, CVV).
    DEBIT_CARD,      // Also processed by CardPaymentStrategy (same validation as credit card).
    BANK_TRANSFER,   // Processed by BankTransferPaymentStrategy (requires bank name + reference).
    CASH             // Processed by CashPaymentStrategy (always succeeds – money already received).
}

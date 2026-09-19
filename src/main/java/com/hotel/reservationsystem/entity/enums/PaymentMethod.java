package com.hotel.reservationsystem.entity.enums;

/**
 * Supported payment methods for UC-05 (Process Payment and Generate Invoice).
 * Each value maps to a concrete PaymentStrategyFactory.PaymentStrategy implementation
 * (see service.PaymentStrategyFactory).
 */
public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    BANK_TRANSFER,
    CASH
}

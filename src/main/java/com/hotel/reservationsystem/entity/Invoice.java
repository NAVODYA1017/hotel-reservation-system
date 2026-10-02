// ═══════════════════════════════════════════════════════════════════════
// FILE : Invoice.java
// UC   : UC-05 – Process Payment and Generate Invoice
// LAYER: Entity (maps to the "invoices" table in MySQL)
//
// An invoice is automatically generated after each successful payment.
// It contains the itemized breakdown (room charges, hall fees, packages)
// plus tax calculations.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.entity;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// InvoiceStatus     – Enum: ISSUED, PAID, CANCELLED, REFUNDED.
// @OneToOne         – JPA: one invoice maps to exactly one payment.
// @ManyToOne        – JPA: many invoices can belong to one reservation
//                     (if multiple partial payments are made).
// BigDecimal        – Precise decimal for monetary values.
// LocalDateTime     – Timestamp for when the invoice was issued.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity                        // JPA entity → maps to database table.
@Table(name = "invoices")      // MySQL table name.
@Data                          // Lombok: generates getters, setters, toString, etc.
@NoArgsConstructor             // Lombok: empty constructor.
@AllArgsConstructor            // Lombok: all-fields constructor.
public class Invoice {

    @Id  // Primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment.
    private Long id;

    // Unique invoice number, e.g. "INV-20261001-4567".
    @Column(nullable = false, unique = true, length = 40)
    private String invoiceNumber;

    // @OneToOne – one invoice is tied to exactly one payment.
    //   unique = true → ensures no two invoices reference the same payment.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;

    // @ManyToOne – many invoices can belong to one reservation
    //   (e.g., if the customer made two partial payments, each gets its own invoice).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    // Price before tax.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    // Tax amount (calculated as subTotal × taxRate).
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;

    // Total amount including tax (subTotal + taxAmount).
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal grandTotal;

    // Invoice status.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.ISSUED;  // Default: just issued.

    // When the invoice was created.
    @Column(nullable = false, updatable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    // @PrePersist – sets the issuedAt timestamp before the first INSERT.
    @PrePersist
    protected void onCreate() {
        this.issuedAt = LocalDateTime.now();
    }
}

package com.hotel.reservationsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UC-05 – Process Payment and Generate Invoice.
 * Owned by: Payment & Billing Management (Ranaweera R.A.Y.N. / IT25104079).
 *
 * Records every attempt made against a reservation's balance. A single
 * reservation can have many payment rows (retries, partial payments,
 * refunds), which is why the running balance lives on {@link Reservation}
 * rather than being derived from a single Payment row.
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String transactionReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_user_id")
    private User processedBy;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Masked card number, bank ref, or note — never raw card/CVV data. */
    @Column(length = 100)
    private String paymentReferenceInfo;

    @Column(length = 255)
    private String failureReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.paidAt = LocalDateTime.now();
    }

    /** Alias for UC-06 (Reports & Analytics), which reads this as "method". */
    @Transient
    @JsonIgnore
    public PaymentMethod getMethod() {
        return paymentMethod;
    }
}

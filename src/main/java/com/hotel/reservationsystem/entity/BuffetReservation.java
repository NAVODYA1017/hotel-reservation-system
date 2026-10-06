package com.hotel.reservationsystem.entity;

import com.hotel.reservationsystem.entity.enums.BuffetReservationStatus;
import com.hotel.reservationsystem.entity.enums.MealSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Buffet dining reservation entity.
 * Maps to MySQL table 'buffet_reservations'.
 * Supports customer online booking, capacity tracking, and front desk check-in verification.
 */
@Entity
@Table(name = "buffet_reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuffetReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique confirmation code, e.g. "BUF-20261006-7241"
    @Column(name = "confirmation_code", nullable = false, unique = true, length = 32)
    private String confirmationCode;

    @Column(name = "guest_name", nullable = false, length = 120)
    private String guestName;

    @Column(name = "guest_email", nullable = false, length = 120)
    private String guestEmail;

    @Column(name = "guest_phone", length = 30)
    private String guestPhone;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_session", nullable = false, length = 25)
    private MealSession mealSession;

    @Column(name = "time_slot", length = 35)
    private String timeSlot;

    @Column(name = "adult_count", nullable = false)
    private int adultCount = 1;

    @Column(name = "child_count", nullable = false)
    private int childCount = 0;

    @Column(name = "number_of_guests", nullable = false)
    private int numberOfGuests = 1;

    @Column(name = "price_per_person", precision = 10, scale = 2)
    private BigDecimal pricePerPerson;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "special_dietary", length = 255)
    private String specialDietary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private BuffetReservationStatus status = BuffetReservationStatus.CONFIRMED;

    @Column(name = "table_number", length = 30)
    private String tableNumber;

    @Column(name = "booked_by", length = 30)
    private String bookedBy = "CLIENT_WEBSITE";

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 25)
    private com.hotel.reservationsystem.entity.enums.PaymentStatus paymentStatus = com.hotel.reservationsystem.entity.enums.PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 25)
    private com.hotel.reservationsystem.entity.enums.PaymentMethod paymentMethod;

    @Column(name = "transaction_reference", length = 45)
    private String transactionReference;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.numberOfGuests = this.adultCount + this.childCount;
    }
}

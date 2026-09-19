package com.hotel.reservationsystem.entity;

import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.ReservationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Shared foundation entity (UC-04: Create and Manage Reservation).
 * Kept here so the Payment & Billing module (UC-05) can compile and run
 * standalone; owned/maintained by the Reservation Management member.
 *
 * Field names (user/checkIn/checkOut/hall/eventPackage) match the team's
 * real ReservationService.java and ReportService.java, confirmed against
 * their actual source rather than guessed.
 *
 * UC-05 depends on {@link #totalAmount}, {@link #amountPaid} and
 * {@link #status} to compute the payable balance and to flip the
 * reservation to PAID once payment succeeds.
 */
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String confirmationCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationType reservationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id")
    private EventHall hall;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private Package eventPackage;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Transient
    public BigDecimal getBalanceDue() {
        return totalAmount.subtract(amountPaid == null ? BigDecimal.ZERO : amountPaid);
    }
}

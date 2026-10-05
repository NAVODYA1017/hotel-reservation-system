package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request / response shapes used only by the Front Desk (receptionist) API: /api/frontdesk/**.
 * Kept together in one holder class so the receptionist module doesn't touch other modules' DTOs.
 */
public final class FrontDeskDtos {

    private FrontDeskDtos() { }

    // ── Dashboard numbers shown at the top of the front desk ──
    public record Summary(
            LocalDate date,
            long arrivalsToday,
            long arrivalsPending,
            long departuresToday,
            long departuresPending,
            long inHouse,
            long totalRooms,
            long availableRooms,
            long occupiedRooms,
            long reservedRooms,
            long maintenanceRooms,
            int occupancyPercent,
            long unverifiedPayments,
            BigDecimal outstandingBalance
    ) { }

    // ── One booking as the receptionist sees it (includes folio balance + stay state) ──
    public record Booking(
            Long id,
            String confirmationCode,
            String status,
            String stayState,          // UPCOMING, ARRIVING, IN_HOUSE, DEPARTING, CHECKED_OUT, CANCELLED, NO_SHOW
            LocalDate checkIn,
            LocalDate checkOut,
            long nights,
            BigDecimal totalAmount,
            BigDecimal amountPaid,
            BigDecimal balanceDue,
            LocalDateTime checkedInAt,
            LocalDateTime checkedOutAt,
            LocalDateTime createdAt,
            Long guestId,
            String guestName,
            String guestEmail,
            String guestPhone,
            Long roomId,
            String roomNumber,
            String roomType,
            String roomStatus,
            String hallName
    ) {
        public static Booking from(Reservation r, LocalDate today) {
            BigDecimal paid = r.getAmountPaid() == null ? BigDecimal.ZERO : r.getAmountPaid();
            BigDecimal total = r.getTotalAmount() == null ? BigDecimal.ZERO : r.getTotalAmount();
            User u = r.getUser();
            Room room = r.getRoom();
            return new Booking(
                    r.getId(), r.getConfirmationCode(), r.getStatus().name(), stayState(r, today),
                    r.getCheckIn(), r.getCheckOut(),
                    java.time.temporal.ChronoUnit.DAYS.between(r.getCheckIn(), r.getCheckOut()),
                    total, paid, total.subtract(paid),
                    r.getCheckedInAt(), r.getCheckedOutAt(), r.getCreatedAt(),
                    u != null ? u.getId() : null,
                    u != null ? u.getName() : null,
                    u != null ? u.getEmail() : null,
                    u != null ? u.getPhoneNumber() : null,
                    room != null ? room.getId() : null,
                    room != null ? room.getRoomNumber() : null,
                    room != null ? room.getRoomType() : null,
                    room != null ? room.getStatus().name() : null,
                    r.getHall() != null ? r.getHall().getName() : null
            );
        }

        /** Where the guest is in their stay, from the receptionist's point of view. */
        public static String stayState(Reservation r, LocalDate today) {
            String status = r.getStatus().name();
            if ("CANCELLED".equals(status)) return "CANCELLED";
            if (r.getCheckedOutAt() != null || "COMPLETED".equals(status)) return "CHECKED_OUT";
            if (r.getCheckedInAt() != null) {
                return r.getCheckOut().isAfter(today) ? "IN_HOUSE" : "DEPARTING";
            }
            if (r.getCheckIn().isAfter(today)) return "UPCOMING";
            if (r.getCheckIn().isEqual(today)) return "ARRIVING";
            // Arrival date has passed and the guest never checked in
            return r.getCheckOut().isAfter(today) ? "ARRIVING" : "NO_SHOW";
        }
    }

    // ── Room rack (room status board) ──
    public record RoomCard(
            Long id,
            String roomNumber,
            String roomType,
            int capacity,
            BigDecimal pricePerNight,
            String status,
            String currentGuest,
            LocalDate currentGuestCheckOut,
            Long currentReservationId,
            String nextArrivalGuest,
            LocalDate nextArrivalDate
    ) { }

    // ── Guest (customer) records ──
    public record GuestSummary(
            Long id,
            String name,
            String email,
            String phone,
            boolean active,
            LocalDateTime memberSince,
            long totalStays,
            long upcomingStays,
            boolean inHouse,
            LocalDate lastStay,
            BigDecimal totalSpent,
            BigDecimal outstandingBalance
    ) { }

    public record GuestProfile(
            GuestSummary guest,
            List<Booking> bookings,
            List<PaymentRow> payments
    ) { }

    // ── Payments ──
    public record PaymentRow(
            Long id,
            String transactionReference,
            Long reservationId,
            String confirmationCode,
            String guestName,
            String roomNumber,
            BigDecimal amount,
            String method,
            String status,
            String referenceInfo,
            String failureReason,
            String processedBy,
            LocalDateTime paidAt,
            LocalDateTime verifiedAt,
            String verifiedBy
    ) {
        public static PaymentRow from(Payment p) {
            Reservation r = p.getReservation();
            return new PaymentRow(
                    p.getId(), p.getTransactionReference(),
                    r != null ? r.getId() : null,
                    r != null ? r.getConfirmationCode() : null,
                    r != null && r.getUser() != null ? r.getUser().getName() : null,
                    r != null && r.getRoom() != null ? r.getRoom().getRoomNumber() : null,
                    p.getAmount(),
                    p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null,
                    p.getStatus() != null ? p.getStatus().name() : null,
                    p.getPaymentReferenceInfo(), p.getFailureReason(),
                    p.getProcessedBy() != null ? p.getProcessedBy().getName() : "Online",
                    p.getPaidAt(), p.getVerifiedAt(), p.getVerifiedBy()
            );
        }
    }

    // ── Requests ──
    public record WalkInRequest(
            String guestName,
            String guestEmail,
            String guestPhone,
            Long roomId,
            LocalDate checkIn,
            LocalDate checkOut,
            boolean checkInNow
    ) { }

    public record DeskPaymentRequest(
            Long reservationId,
            BigDecimal amount,
            String method,          // CASH or BANK_TRANSFER (card payments go through the POS / online)
            String bankName,
            String bankReference
    ) { }

    public record GuestUpdateRequest(String name, String phone) { }

    public record RoomStatusRequest(String status) { }

    public record StayChangeRequest(LocalDate checkOut) { }
}

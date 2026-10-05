package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.FrontDeskDtos.*;
import com.hotel.reservationsystem.dto.PaymentRequest;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.PaymentRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import com.hotel.reservationsystem.repository.RoomRepository;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Front Desk (Receptionist) operations.
 *
 * Covers the receptionist's daily work:
 *   - Today's arrivals / departures / in-house guests
 *   - Walk-in bookings, check-in, check-out (folio must be settled), stay extension, no-show/cancel
 *   - Room rack: see every room's live status and mark rooms clean (AVAILABLE) or out of order (MAINTENANCE)
 *   - Guest (customer) records: search, view history, update contact details
 *   - Payments: take cash / bank transfer at the desk and verify online payments
 *
 * Every public method expects the caller (FrontDeskController) to have already checked the
 * signed-in user's role with AdminAccessService.requireFrontDesk().
 */
@Service
public class FrontDeskService {

    private static final Set<ReservationStatus> CLOSED = Set.of(ReservationStatus.CANCELLED, ReservationStatus.COMPLETED);

    @Autowired private ReservationRepository reservationRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ReservationService reservationService;
    @Autowired private PaymentService paymentService;

    // ═════════════════════════════════════════════
    // DASHBOARD
    // ═════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Summary summary() {
        LocalDate today = LocalDate.now();
        List<Reservation> stays = roomReservations();

        List<Reservation> arrivals = stays.stream().filter(isArrivalOn(today)).toList();
        List<Reservation> departures = stays.stream().filter(isDepartureOn(today)).toList();
        long inHouse = stays.stream().filter(this::isInHouse).count();

        List<Room> rooms = roomRepository.findAll();
        long occupied = rooms.stream().filter(r -> r.getStatus() == RoomStatus.OCCUPIED).count();
        long available = rooms.stream().filter(r -> r.getStatus() == RoomStatus.AVAILABLE).count();
        long reserved = rooms.stream().filter(r -> r.getStatus() == RoomStatus.RESERVED).count();
        long maintenance = rooms.stream().filter(r -> r.getStatus() == RoomStatus.MAINTENANCE).count();
        int occupancy = rooms.isEmpty() ? 0 : (int) Math.round(occupied * 100.0 / rooms.size());

        long unverified = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS && p.getVerifiedAt() == null)
                .count();

        BigDecimal outstanding = reservationRepository.findAll().stream()
                .filter(r -> !CLOSED.contains(r.getStatus()) || isInHouse(r))
                .map(this::balance)
                .filter(b -> b.signum() > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new Summary(today,
                arrivals.size(), arrivals.stream().filter(r -> r.getCheckedInAt() == null).count(),
                departures.size(), departures.stream().filter(r -> r.getCheckedOutAt() == null).count(),
                inHouse, rooms.size(), available, occupied, reserved, maintenance, occupancy,
                unverified, outstanding);
    }

    // ═════════════════════════════════════════════
    // ARRIVALS / DEPARTURES / IN-HOUSE
    // ═════════════════════════════════════════════

    /** Guests due to arrive today, late arrivals from previous days, and guests already checked in today. */
    @Transactional(readOnly = true)
    public List<Booking> arrivals() {
        LocalDate today = LocalDate.now();
        return roomReservations().stream()
                .filter(isArrivalOn(today))
                .sorted(Comparator.comparing((Reservation r) -> r.getCheckedInAt() != null)
                        .thenComparing(r -> r.getRoom().getRoomNumber()))
                .map(r -> Booking.from(r, today))
                .toList();
    }

    /** In-house guests due out today (or overdue), plus guests already checked out today. */
    @Transactional(readOnly = true)
    public List<Booking> departures() {
        LocalDate today = LocalDate.now();
        return roomReservations().stream()
                .filter(isDepartureOn(today))
                .sorted(Comparator.comparing((Reservation r) -> r.getCheckedOutAt() != null)
                        .thenComparing(r -> r.getRoom().getRoomNumber()))
                .map(r -> Booking.from(r, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Booking> inHouse() {
        LocalDate today = LocalDate.now();
        return roomReservations().stream()
                .filter(this::isInHouse)
                .sorted(Comparator.comparing(r -> r.getRoom().getRoomNumber()))
                .map(r -> Booking.from(r, today))
                .toList();
    }

    /** Reservation search: confirmation code, guest name / email / phone or room number. */
    @Transactional(readOnly = true)
    public List<Booking> searchReservations(String query, String state) {
        LocalDate today = LocalDate.now();
        String q = normalise(query);
        return reservationRepository.findAll().stream()
                .filter(r -> q.isEmpty() || matches(q,
                        r.getConfirmationCode(),
                        r.getUser() != null ? r.getUser().getName() : null,
                        r.getUser() != null ? r.getUser().getEmail() : null,
                        r.getUser() != null ? r.getUser().getPhoneNumber() : null,
                        r.getRoom() != null ? r.getRoom().getRoomNumber() : null,
                        r.getHall() != null ? r.getHall().getName() : null))
                .map(r -> Booking.from(r, today))
                .filter(b -> state == null || state.isBlank() || state.equalsIgnoreCase(b.stayState()))
                .sorted(Comparator.comparing(Booking::checkIn).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public Booking getBooking(Long id) {
        return Booking.from(findReservation(id), LocalDate.now());
    }

    // ═════════════════════════════════════════════
    // WALK-IN / CHECK-IN / CHECK-OUT
    // ═════════════════════════════════════════════
    @Transactional
    public Booking walkIn(WalkInRequest req) {
        if (req.guestName() == null || req.guestName().isBlank()) {
            throw new IllegalArgumentException("Guest name is required.");
        }
        if (req.guestEmail() == null || !req.guestEmail().trim().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalArgumentException("A valid guest email is required (used for the booking confirmation).");
        }
        if (req.guestPhone() == null || req.guestPhone().replaceAll("[^0-9]", "").length() < 9) {
            throw new IllegalArgumentException("A valid guest phone number is required.");
        }
        if (req.roomId() == null) {
            throw new IllegalArgumentException("Select a room.");
        }
        if (req.checkIn() == null || req.checkIn().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Arrival date cannot be in the past.");
        }

        // Existing guest accounts must really be customers (never attach a booking to a staff account)
        userRepository.findByEmail(req.guestEmail().trim()).ifPresent(existing -> {
            if (existing.getRole() != Role.CUSTOMER) {
                throw new IllegalArgumentException("That email belongs to a staff account. Use the guest's own email.");
            }
        });

        ReservationRequest booking = new ReservationRequest();
        booking.setGuestName(req.guestName().trim());
        booking.setGuestEmail(req.guestEmail().trim().toLowerCase(Locale.ROOT));
        booking.setRoomId(req.roomId());
        booking.setCheckIn(req.checkIn());
        booking.setCheckOut(req.checkOut());

        // Re-uses the booking engine: date validation, availability + double-booking checks, pricing
        ReservationResponse created = reservationService.createReservation(booking);

        Reservation reservation = findReservation(created.getId());
        User guest = reservation.getUser();
        if (guest != null && (guest.getPhoneNumber() == null || guest.getPhoneNumber().isBlank())) {
            guest.setPhoneNumber(req.guestPhone().trim());
            userRepository.save(guest);
        }

        if (req.checkInNow() && req.checkIn().isEqual(LocalDate.now())) {
            return checkIn(reservation.getId());
        }
        return Booking.from(reservation, LocalDate.now());
    }

    @Transactional
    public Booking checkIn(Long reservationId) {
        Reservation r = findReservation(reservationId);
        LocalDate today = LocalDate.now();

        if (r.getRoom() == null) {
            throw new IllegalStateException("Only room reservations can be checked in at the front desk.");
        }
        if (r.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("Reservation " + r.getConfirmationCode() + " is cancelled.");
        }
        if (r.getCheckedInAt() != null) {
            throw new IllegalStateException(r.getUser().getName() + " is already checked in to room " + r.getRoom().getRoomNumber() + ".");
        }
        if (r.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("This stay has already been completed.");
        }
        if (r.getCheckIn().isAfter(today)) {
            throw new IllegalStateException("Early check-in is not possible. This reservation starts on " + r.getCheckIn() + ".");
        }
        if (!r.getCheckOut().isAfter(today)) {
            throw new IllegalStateException("The stay dates for this reservation have already passed. Mark it as a no-show instead.");
        }

        Room room = r.getRoom();
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new IllegalStateException("Room " + room.getRoomNumber() + " is not ready (cleaning / maintenance). Mark it ready on the Room Rack first.");
        }
        boolean someoneElseInRoom = roomReservations().stream()
                .anyMatch(o -> !o.getId().equals(r.getId()) && isInHouse(o) && o.getRoom().getId().equals(room.getId()));
        if (someoneElseInRoom) {
            throw new IllegalStateException("Room " + room.getRoomNumber() + " is still occupied by another guest.");
        }

        r.setCheckedInAt(LocalDateTime.now());
        if (r.getStatus() == ReservationStatus.PENDING) {
            r.setStatus(ReservationStatus.CONFIRMED);
        }
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);
        reservationRepository.save(r);
        return Booking.from(r, today);
    }

    @Transactional
    public Booking checkOut(Long reservationId) {
        Reservation r = findReservation(reservationId);
        if (r.getCheckedInAt() == null) {
            throw new IllegalStateException("This guest has not been checked in.");
        }
        if (r.getCheckedOutAt() != null) {
            throw new IllegalStateException("This guest has already checked out.");
        }
        BigDecimal due = balance(r);
        if (due.signum() > 0) {
            throw new IllegalStateException("Outstanding balance of LKR " + due.toPlainString()
                    + " must be settled before check-out. Take the payment first.");
        }

        r.setCheckedOutAt(LocalDateTime.now());
        r.setStatus(ReservationStatus.COMPLETED);
        reservationRepository.save(r);

        // Room goes to housekeeping before it can be sold again
        Room room = r.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.MAINTENANCE);
            roomRepository.save(room);
        }
        return Booking.from(r, LocalDate.now());
    }

    /** Extend (or shorten) an active stay. Price is recalculated and checked for clashes by the booking engine. */
    @Transactional
    public Booking changeCheckOut(Long reservationId, LocalDate newCheckOut) {
        Reservation r = findReservation(reservationId);
        if (newCheckOut == null) {
            throw new IllegalArgumentException("Choose the new departure date.");
        }
        if (r.getCheckedOutAt() != null || CLOSED.contains(r.getStatus())) {
            throw new IllegalStateException("Only active reservations can be changed.");
        }
        if (r.getCheckedInAt() != null && !newCheckOut.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("For an in-house guest the new departure date must be after today. Use Check-out to end the stay.");
        }

        ReservationRequest change = new ReservationRequest();
        change.setCheckIn(r.getCheckIn());
        change.setCheckOut(newCheckOut);
        reservationService.modifyReservation(r.getId(), change);

        Reservation updated = findReservation(reservationId);
        // Keep payment status honest after the price change
        BigDecimal paid = updated.getAmountPaid() == null ? BigDecimal.ZERO : updated.getAmountPaid();
        if (paid.compareTo(updated.getTotalAmount()) >= 0 && paid.signum() > 0) {
            updated.setStatus(ReservationStatus.PAID);
        } else if (paid.signum() > 0) {
            updated.setStatus(ReservationStatus.AWAITING_PAYMENT);
        }
        reservationRepository.save(updated);
        return Booking.from(updated, LocalDate.now());
    }

    /** Cancel a booking or mark a no-show. Not allowed once the guest is in the room. */
    @Transactional
    public Booking cancel(Long reservationId) {
        Reservation r = findReservation(reservationId);
        if (r.getCheckedInAt() != null) {
            throw new IllegalStateException("The guest is already checked in. Use Check-out instead.");
        }
        reservationService.cancelReservation(reservationId);
        return Booking.from(findReservation(reservationId), LocalDate.now());
    }

    // ═════════════════════════════════════════════
    // ROOM RACK
    // ═════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<RoomCard> rooms() {
        LocalDate today = LocalDate.now();
        List<Reservation> stays = roomReservations();
        return roomRepository.findAll().stream()
                .sorted(Comparator.comparing(Room::getRoomNumber))
                .map(room -> {
                    Reservation current = stays.stream()
                            .filter(r -> r.getRoom().getId().equals(room.getId()) && isInHouse(r))
                            .findFirst().orElse(null);
                    Reservation next = stays.stream()
                            .filter(r -> r.getRoom().getId().equals(room.getId()))
                            .filter(r -> r.getCheckedInAt() == null && !CLOSED.contains(r.getStatus()))
                            .filter(r -> !r.getCheckOut().isBefore(today) && r.getCheckOut().isAfter(today))
                            .min(Comparator.comparing(Reservation::getCheckIn))
                            .orElse(null);
                    return new RoomCard(room.getId(), room.getRoomNumber(), room.getRoomType(), room.getCapacity(),
                            room.getPricePerNight(), room.getStatus().name(),
                            current != null ? current.getUser().getName() : null,
                            current != null ? current.getCheckOut() : null,
                            current != null ? current.getId() : null,
                            next != null ? next.getUser().getName() : null,
                            next != null ? next.getCheckIn() : null);
                })
                .toList();
    }

    /** Housekeeping updates only: a room can be marked clean (AVAILABLE) or out of order (MAINTENANCE). */
    @Transactional
    public RoomCard setRoomStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
        RoomStatus target;
        try {
            target = RoomStatus.valueOf(status == null ? "" : status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Status must be AVAILABLE or MAINTENANCE.");
        }
        if (target != RoomStatus.AVAILABLE && target != RoomStatus.MAINTENANCE) {
            throw new IllegalArgumentException("Front desk can only mark rooms as AVAILABLE (clean) or MAINTENANCE (out of order).");
        }
        boolean occupied = roomReservations().stream()
                .anyMatch(r -> r.getRoom().getId().equals(roomId) && isInHouse(r));
        if (occupied) {
            throw new IllegalStateException("Room " + room.getRoomNumber() + " has a guest in-house. Check the guest out first.");
        }
        room.setStatus(target);
        roomRepository.save(room);
        return rooms().stream().filter(c -> c.id().equals(roomId)).findFirst().orElseThrow();
    }

    // ═════════════════════════════════════════════
    // GUEST RECORDS
    // ═════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<GuestSummary> guests(String query) {
        String q = normalise(query);
        List<Reservation> all = reservationRepository.findAll();
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .filter(u -> q.isEmpty() || matches(q, u.getName(), u.getEmail(), u.getPhoneNumber()))
                .map(u -> guestSummary(u, all))
                .sorted(Comparator.comparing(GuestSummary::inHouse).reversed()
                        .thenComparing(GuestSummary::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional(readOnly = true)
    public GuestProfile guest(Long guestId) {
        User u = findGuest(guestId);
        LocalDate today = LocalDate.now();
        List<Reservation> mine = reservationRepository.findByUser_Id(guestId);
        List<Booking> bookings = mine.stream()
                .sorted(Comparator.comparing(Reservation::getCheckIn).reversed())
                .map(r -> Booking.from(r, today)).toList();
        List<PaymentRow> payments = paymentRepository.findByReservation_User_IdOrderByPaidAtDesc(guestId).stream()
                .map(PaymentRow::from).toList();
        return new GuestProfile(guestSummary(u, mine), bookings, payments);
    }

    @Transactional
    public GuestProfile updateGuest(Long guestId, GuestUpdateRequest req) {
        User u = findGuest(guestId);
        if (req.name() != null) {
            if (req.name().isBlank()) throw new IllegalArgumentException("Guest name cannot be empty.");
            u.setName(req.name().trim());
        }
        if (req.phone() != null) {
            String phone = req.phone().trim();
            if (!phone.isEmpty() && phone.replaceAll("[^0-9]", "").length() < 9) {
                throw new IllegalArgumentException("Enter a valid phone number.");
            }
            u.setPhoneNumber(phone.isEmpty() ? null : phone);
        }
        userRepository.save(u);
        return guest(guestId);
    }

    // ═════════════════════════════════════════════
    // PAYMENTS
    // ═════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<PaymentRow> payments(String filter) {
        Predicate<Payment> keep = switch (filter == null ? "" : filter.toUpperCase(Locale.ROOT)) {
            case "UNVERIFIED" -> p -> p.getStatus() == PaymentStatus.SUCCESS && p.getVerifiedAt() == null;
            case "VERIFIED" -> p -> p.getVerifiedAt() != null;
            case "FAILED" -> p -> p.getStatus() == PaymentStatus.FAILED;
            case "TODAY" -> p -> p.getPaidAt() != null && p.getPaidAt().toLocalDate().isEqual(LocalDate.now());
            default -> p -> true;
        };
        return paymentRepository.findAllByOrderByPaidAtDesc().stream().filter(keep).map(PaymentRow::from).toList();
    }

    /** Take a payment at the desk (cash or bank transfer). Desk payments are verified automatically by the cashier. */
    @Transactional
    public PaymentRow takePayment(DeskPaymentRequest req, User cashier) {
        if (req.reservationId() == null) throw new IllegalArgumentException("Select the reservation.");
        if (req.amount() == null || req.amount().signum() <= 0) throw new IllegalArgumentException("Enter an amount greater than zero.");

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(req.method() == null ? "" : req.method().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Payment method must be CASH or BANK_TRANSFER.");
        }
        if (method != PaymentMethod.CASH && method != PaymentMethod.BANK_TRANSFER) {
            throw new IllegalArgumentException("At the desk take CASH or BANK_TRANSFER. Card payments are made on the card machine or online.");
        }

        PaymentRequest pr = new PaymentRequest();
        pr.setReservationId(req.reservationId());
        pr.setAmount(req.amount());
        pr.setPaymentMethod(method);
        pr.setBankName(req.bankName());
        pr.setBankReferenceNumber(req.bankReference());

        PaymentResponse done = paymentService.processPayment(pr);

        Payment payment = paymentRepository.findById(done.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found after processing."));
        payment.setProcessedBy(cashier);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setVerifiedBy(cashier.getName());
        return PaymentRow.from(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentRow verifyPayment(Long paymentId, User staff) {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentId));
        if (p.getStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful payments can be verified (this one is " + p.getStatus() + ").");
        }
        if (p.getVerifiedAt() != null) {
            throw new IllegalStateException("Already verified by " + p.getVerifiedBy() + ".");
        }
        p.setVerifiedAt(LocalDateTime.now());
        p.setVerifiedBy(staff.getName());
        return PaymentRow.from(paymentRepository.save(p));
    }

    // ═════════════════════════════════════════════
    // HELPERS
    // ═════════════════════════════════════════════
    private List<Reservation> roomReservations() {
        return reservationRepository.findAll().stream().filter(r -> r.getRoom() != null).collect(Collectors.toList());
    }

    private boolean isInHouse(Reservation r) {
        return r.getCheckedInAt() != null && r.getCheckedOutAt() == null && r.getStatus() != ReservationStatus.CANCELLED;
    }

    private Predicate<Reservation> isArrivalOn(LocalDate day) {
        return r -> {
            if (r.getStatus() == ReservationStatus.CANCELLED) return false;
            boolean dueToday = r.getCheckIn().isEqual(day);
            boolean lateArrival = r.getCheckIn().isBefore(day) && r.getCheckOut().isAfter(day) && r.getCheckedInAt() == null
                    && r.getStatus() != ReservationStatus.COMPLETED;
            boolean arrivedToday = r.getCheckedInAt() != null && r.getCheckedInAt().toLocalDate().isEqual(day);
            return dueToday || lateArrival || arrivedToday;
        };
    }

    private Predicate<Reservation> isDepartureOn(LocalDate day) {
        return r -> {
            boolean dueOut = isInHouse(r) && !r.getCheckOut().isAfter(day);
            boolean leftToday = r.getCheckedOutAt() != null && r.getCheckedOutAt().toLocalDate().isEqual(day);
            return dueOut || leftToday;
        };
    }

    private BigDecimal balance(Reservation r) {
        BigDecimal total = r.getTotalAmount() == null ? BigDecimal.ZERO : r.getTotalAmount();
        BigDecimal paid = r.getAmountPaid() == null ? BigDecimal.ZERO : r.getAmountPaid();
        return total.subtract(paid);
    }

    private GuestSummary guestSummary(User u, List<Reservation> source) {
        LocalDate today = LocalDate.now();
        List<Reservation> mine = source.stream()
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(u.getId()))
                .toList();
        long stays = mine.stream().filter(r -> r.getStatus() == ReservationStatus.COMPLETED || r.getCheckedInAt() != null).count();
        long upcoming = mine.stream().filter(r -> !CLOSED.contains(r.getStatus()) && r.getCheckedInAt() == null
                && !r.getCheckOut().isBefore(today)).count();
        boolean inHouse = mine.stream().anyMatch(this::isInHouse);
        LocalDate last = mine.stream().filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .map(Reservation::getCheckIn).filter(d -> !d.isAfter(today))
                .max(Comparator.naturalOrder()).orElse(null);
        BigDecimal spent = mine.stream().map(Reservation::getAmountPaid).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal owing = mine.stream().filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .map(this::balance).filter(b -> b.signum() > 0).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new GuestSummary(u.getId(), u.getName(), u.getEmail(), u.getPhoneNumber(), u.isActive(),
                u.getCreatedAt(), stays, upcoming, inHouse, last, spent, owing);
    }

    private Reservation findReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
    }

    private User findGuest(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found: " + id));
        if (u.getRole() != Role.CUSTOMER) {
            // Receptionists may not view or edit staff accounts
            throw new ResourceNotFoundException("Guest not found: " + id);
        }
        return u;
    }

    private static String normalise(String s) {
        return s == null ? "" : s.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean matches(String q, String... fields) {
        for (String f : fields) {
            if (f != null && f.toLowerCase(Locale.ROOT).contains(q)) return true;
        }
        return false;
    }
}

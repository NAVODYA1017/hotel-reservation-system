// ═══════════════════════════════════════════════════════════════════════
// FILE    : ReservationService.java
// USE CASE: UC-04 – Create and Manage Reservation
// ACTORS  : Primary: Customer | Secondary: Receptionist, Event Coordinator
// MEMBER  : Hettiarachchi K. N.
// REG NO  : IT25104004
// ROLE    : Service Layer (Business Logic & Transaction Management)
// ═══════════════════════════════════════════════════════════════════════
//
// ── VIVA ARCHITECTURE OVERVIEW ─────────────────────────────────────────
// This service encapsulates the core booking engine of the Hotel Reservation
// System. It enforces strict transactional integrity, real-time availability
// validation, conflict detection algorithms, and automatic cost calculations.
//
// ── KEY BUSINESS RULES & EXTENSIONS IMPLEMENTED ───────────────────────
// • Main Scenario Step 4 & 5 : Real-time availability verification
// • Main Scenario Step 7     : Dynamic pricing calculation (nights * rate or hall + package)
// • Main Scenario Step 10 & 11: Creates reservation & generates unique booking confirmation (RES-XXXXXXXX)
// • Extension 4a             : If room or hall is unavailable (e.g. MAINTENANCE / inactive), rejects with guidance
// • Extension 8a             : Overlapping date conflict check prevents double booking
// • Extension 12a            : Modify existing booking dates with automated price recalculation and overlap re-check
// • Extension 12b            : Cancel booking (soft-update to CANCELLED), releasing inventory for other guests
// • Open Issue 1             : Modification & cancellation business rules, audit trail preservation
// ═══════════════════════════════════════════════════════════════════════

package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.entity.*;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.ReservationType;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for UC-04: Reservation Management.
 * Annotated with @Service so Spring registers it as a Singleton bean in the IoC container.
 */
@Service
public class ReservationService {

    // ── DEPENDENCY INJECTIONS ─────────────────────────────────────────
    // Using Spring's @Autowired to inject DAO repositories for entities.
    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EventHallRepository eventHallRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE RESERVATION – Main Scenario Steps 1–11
    // Handles customer checkout, date validation, real-time availability (Ext 4a),
    // conflict check (Ext 8a), and price calculation (Step 7).
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {

        // Step 1: Customer identification / resolution
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null && request.getGuestEmail() != null && !request.getGuestEmail().isBlank()) {
            user = userRepository.findByEmail(request.getGuestEmail().trim()).orElse(null);
            if (user == null) {
                // Auto-provision guest user account so guest checkout never fails
                User newGuest = new User();
                newGuest.setName(request.getGuestName() != null && !request.getGuestName().isBlank() ? request.getGuestName().trim() : "Valued Guest");
                newGuest.setEmail(request.getGuestEmail().trim());
                newGuest.setRole(Role.CUSTOMER);
                newGuest.setPasswordHash("$2a$10$dummyHashForGuestAutoCreatedUserAccount12345");
                user = userRepository.save(newGuest);
            }
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No users found to associate with reservation."));
        }

        // Step 6: Validate selection: Room OR Hall, never both, never neither
        if (request.getRoomId() != null && request.getHallId() != null) {
            throw new IllegalArgumentException("Cannot book both a room and a hall in one reservation. Please place separate bookings.");
        }
        if (request.getRoomId() == null && request.getHallId() == null) {
            throw new IllegalArgumentException("Must select either a room or an event hall to proceed with reservation.");
        }

        // Step 3: Validate booking dates
        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required.");
        }
        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new IllegalArgumentException("Check-out date must be at least one day after check-in date.");
        }

        // Build the new Reservation entity
        Reservation reservation = new Reservation();
        // Step 11: System generates unique booking confirmation code (e.g. RES-XXXXXXXX)
        reservation.setConfirmationCode("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        reservation.setUser(user);
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setReservationType(request.getRoomId() != null ? ReservationType.ROOM : ReservationType.EVENT_HALL);

        BigDecimal totalAmount;

        // ── A. ROOM RESERVATION FLOW ─────────────────────────────────
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Room not found with ID: " + request.getRoomId()));

            // Extension 4a: Check real-time room availability status
            if (room.getStatus() != RoomStatus.AVAILABLE) {
                throw new IllegalStateException("Room " + room.getRoomNumber() + " is currently " + room.getStatus() + ". Please select another room.");
            }

            // Extension 8a: Overlapping date conflict check
            if (isRoomBooked(room.getId(), request.getCheckIn(), request.getCheckOut(), null)) {
                throw new IllegalStateException("Room " + room.getRoomNumber() + " is already booked for the selected dates (" + request.getCheckIn() + " to " + request.getCheckOut() + "). Please choose different dates or another room.");
            }

            // Step 7: System calculates total reservation amount: nights * price_per_night
            long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            totalAmount = room.getPrice().multiply(BigDecimal.valueOf(nights));
            reservation.setRoom(room);
        }
        // ── B. EVENT HALL RESERVATION FLOW ───────────────────────────
        else {
            EventHall hall = eventHallRepository.findById(request.getHallId())
                    .orElseThrow(() -> new IllegalArgumentException("Event hall not found with ID: " + request.getHallId()));

            // Extension 4a: Check real-time hall availability status
            if (!hall.isAvailable()) {
                throw new IllegalStateException("Event Hall '" + hall.getName() + "' is currently marked as unavailable. Please select another event hall.");
            }

            // Extension 8a: Overlapping date conflict check for hall
            if (isHallBooked(hall.getId(), request.getCheckIn(), request.getCheckOut(), null)) {
                throw new IllegalStateException("Event Hall '" + hall.getName() + "' is already booked for the selected dates. Please choose different dates.");
            }

            // Step 7: Calculate total: hall price + optional package price
            totalAmount = hall.getPrice();
            reservation.setHall(hall);

            if (request.getPackageId() != null) {
                Package eventPackage = packageRepository.findById(request.getPackageId())
                        .orElseThrow(() -> new IllegalArgumentException("Package not found with ID: " + request.getPackageId()));
                totalAmount = totalAmount.add(eventPackage.getPrice());
                reservation.setEventPackage(eventPackage);
            }
        }

        reservation.setTotalAmount(totalAmount);

        // Step 10: Persist reservation in MySQL
        Reservation saved = reservationRepository.save(reservation);

        // Step 11 & 12: Return populated response DTO
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL RESERVATIONS – Admin & Receptionist Overview
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET ONE RESERVATION BY ID
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));
        return mapToResponse(reservation);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3B. GET ALL RESERVATIONS BY USER ID – Main Scenario Step 12
    // Customer views their own reservations under "My Reservations"
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUser_Id(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. CANCEL A RESERVATION – Extension 12b & Open Issue 1
    // Soft-cancels reservation to CANCELLED status, releasing the room/hall
    // while keeping financial records intact for audit integrity.
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("Reservation #" + reservation.getConfirmationCode() + " is already CANCELLED.");
        }
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed stay.");
        }

        // Extension 12b: Mark status as CANCELLED (frees room for date checks)
        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. MODIFY A RESERVATION – Extension 12a
    // Customer modifies dates of an existing active booking.
    // Validates date range, checks new date conflicts, and recalculates total.
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public ReservationResponse modifyReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        // Open Issue 1: Rule: Only PENDING or CONFIRMED reservations can be modified
        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Cannot modify a " + reservation.getStatus() + " reservation.");
        }

        // Validate new dates
        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new IllegalArgumentException("Both new check-in and check-out dates are required for modification.");
        }
        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }

        // Conflict check on new dates (excluding current reservation ID)
        if (reservation.getRoom() != null) {
            if (isRoomBooked(reservation.getRoom().getId(), request.getCheckIn(), request.getCheckOut(), reservation.getId())) {
                throw new IllegalStateException("Room " + reservation.getRoom().getRoomNumber() + " is already booked for the new dates. Please choose different dates.");
            }

            // Recalculate total amount for new date span
            long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            reservation.setTotalAmount(reservation.getRoom().getPrice().multiply(BigDecimal.valueOf(nights)));
        } else if (reservation.getHall() != null) {
            if (isHallBooked(reservation.getHall().getId(), request.getCheckIn(), request.getCheckOut(), reservation.getId())) {
                throw new IllegalStateException("Event Hall '" + reservation.getHall().getName() + "' is already booked for the new dates.");
            }
        }

        // Update dates
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. DELETE A RESERVATION (CRUD Hard Delete)
    // Safely removes associated invoices & payments before deleting.
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with ID: " + id));

        // Cascading cleanup of dependent child rows in payments & invoices
        List<Invoice> invoices = invoiceRepository.findByReservationIdOrderByIssuedAtDesc(id);
        if (!invoices.isEmpty()) {
            invoiceRepository.deleteAll(invoices);
        }

        List<Payment> payments = paymentRepository.findByReservationIdOrderByPaidAtDesc(id);
        if (!payments.isEmpty()) {
            paymentRepository.deleteAll(payments);
        }

        reservationRepository.delete(reservation);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Real-time Room Booking Conflict Detector (Extension 8a)
    // ─────────────────────────────────────────────────────────────────
    private boolean isRoomBooked(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeReservationId) {
        return reservationRepository.findAll().stream()
                .filter(r -> excludeReservationId == null || !r.getId().equals(excludeReservationId))
                .filter(r -> r.getRoom() != null && r.getRoom().getId().equals(roomId))
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .anyMatch(r -> r.getCheckIn().isBefore(checkOut) && r.getCheckOut().isAfter(checkIn));
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Real-time Hall Booking Conflict Detector (Extension 8a)
    // ─────────────────────────────────────────────────────────────────
    private boolean isHallBooked(Long hallId, LocalDate checkIn, LocalDate checkOut, Long excludeReservationId) {
        return reservationRepository.findAll().stream()
                .filter(r -> excludeReservationId == null || !r.getId().equals(excludeReservationId))
                .filter(r -> r.getHall() != null && r.getHall().getId().equals(hallId))
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .anyMatch(r -> r.getCheckIn().isBefore(checkOut) && r.getCheckOut().isAfter(checkIn));
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Convert Entity → Response DTO
    // Decouples database entities from frontend JSON contracts.
    // ─────────────────────────────────────────────────────────────────
    private ReservationResponse mapToResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setConfirmationCode(reservation.getConfirmationCode());
        response.setStatus(reservation.getStatus().name());
        response.setCheckIn(reservation.getCheckIn());
        response.setCheckOut(reservation.getCheckOut());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setCreatedAt(reservation.getCreatedAt());

        // Guest info
        if (reservation.getUser() != null) {
            response.setUserId(reservation.getUser().getId());
            response.setUserName(reservation.getUser().getName());
            response.setUserEmail(reservation.getUser().getEmail());
            response.setUserPhone(reservation.getUser().getPhoneNumber());
        }

        // Room info (for room reservation)
        if (reservation.getRoom() != null) {
            response.setRoomId(reservation.getRoom().getId());
            response.setRoomNumber(reservation.getRoom().getRoomNumber());
            response.setRoomType(reservation.getRoom().getRoomType());
        }

        // Hall info (for event hall reservation)
        if (reservation.getHall() != null) {
            response.setHallId(reservation.getHall().getId());
            response.setHallName(reservation.getHall().getName());
        }

        // Package info (for hall package reservation)
        if (reservation.getEventPackage() != null) {
            response.setPackageId(reservation.getEventPackage().getId());
            response.setPackageName(reservation.getEventPackage().getName());
        }

        return response;
    }
}

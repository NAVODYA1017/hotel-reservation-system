package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.entity.*;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.ReservationType;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService {

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

    // ──────────────────────────────────────────────
    // 1. CREATE A NEW RESERVATION
    // ──────────────────────────────────────────────
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {

        // Find or create customer
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null && request.getGuestEmail() != null && !request.getGuestEmail().isBlank()) {
            user = userRepository.findByEmail(request.getGuestEmail().trim()).orElse(null);
            if (user == null) {
                // Auto-create guest user so customer doesn't get blocked
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
                    .orElseThrow(() -> new RuntimeException("No users found to associate with reservation"));
        }

        // Validate: must book either a room OR a hall, not both
        if (request.getRoomId() != null && request.getHallId() != null) {
            throw new RuntimeException("Cannot book both a room and a hall in one reservation");
        }
        if (request.getRoomId() == null && request.getHallId() == null) {
            throw new RuntimeException("Must book either a room or a hall");
        }

        if (request.getCheckIn() == null || request.getCheckOut() == null) {
            throw new RuntimeException("Check-in and check-out dates are required");
        }

        // Validate dates
        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // Build the reservation
        Reservation reservation = new Reservation();
        reservation.setConfirmationCode("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        reservation.setUser(user);
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setReservationType(request.getRoomId() != null ? ReservationType.ROOM : ReservationType.EVENT_HALL);

        BigDecimal totalAmount;

        // ROOM BOOKING
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));

            // Check if room is available for these dates
            if (isRoomBooked(room.getId(), request.getCheckIn(), request.getCheckOut())) {
                throw new RuntimeException("Room " + room.getRoomNumber() + " is already booked for these dates");
            }

            long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            totalAmount = room.getPrice().multiply(BigDecimal.valueOf(nights));
            reservation.setRoom(room);
        }
        // HALL BOOKING
        else {
            EventHall hall = eventHallRepository.findById(request.getHallId())
                    .orElseThrow(() -> new RuntimeException("Event hall not found with ID: " + request.getHallId()));

            // Check if hall is available for these dates
            if (isHallBooked(hall.getId(), request.getCheckIn(), request.getCheckOut())) {
                throw new RuntimeException("Hall " + hall.getName() + " is already booked for these dates");
            }

            totalAmount = hall.getPrice();
            reservation.setHall(hall);

            // Add package cost if selected
            if (request.getPackageId() != null) {
                Package eventPackage = packageRepository.findById(request.getPackageId())
                        .orElseThrow(() -> new RuntimeException("Package not found with ID: " + request.getPackageId()));
                totalAmount = totalAmount.add(eventPackage.getPrice());
                reservation.setEventPackage(eventPackage);
            }
        }

        reservation.setTotalAmount(totalAmount);

        // Save to database
        Reservation saved = reservationRepository.save(reservation);

        // Convert to response and return
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────
    // 2. GET ALL RESERVATIONS
    // ──────────────────────────────────────────────
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // 3. GET ONE RESERVATION BY ID
    // ──────────────────────────────────────────────
    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + id));
        return mapToResponse(reservation);
    }

    // ──────────────────────────────────────────────
    // 3B. GET ALL RESERVATIONS BY USER ID (UC-04)
    // ──────────────────────────────────────────────
    public List<ReservationResponse> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUser_Id(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────
    // 4. CANCEL A RESERVATION
    // ──────────────────────────────────────────────
    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────
    // 4B. DELETE A RESERVATION (CRUD DELETE)
    // ──────────────────────────────────────────────
    @Transactional
    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + id));

        // Safely remove associated invoices & payments before deleting reservation
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

    // ──────────────────────────────────────────────
    // 5. MODIFY A RESERVATION (Extension 12a)
    // ──────────────────────────────────────────────
    public ReservationResponse modifyReservation(Long id, ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + id));

        if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Cannot modify a cancelled or completed reservation");
        }

        // Validate new dates
        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // Check if room is available for the NEW dates (ignoring this exact reservation)
        if (reservation.getRoom() != null) {
            boolean isBooked = reservationRepository.findAll().stream()
                    .filter(r -> !r.getId().equals(reservation.getId())) // ignore current booking
                    .filter(r -> r.getRoom() != null && r.getRoom().getId().equals(reservation.getRoom().getId()))
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                    .filter(r -> r.getCheckIn().isBefore(request.getCheckOut()) && r.getCheckOut().isAfter(request.getCheckIn()))
                    .findAny().isPresent();

            if (isBooked) {
                throw new RuntimeException("Room is already booked for these new dates");
            }

            // Recalculate total amount
            long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
            reservation.setTotalAmount(reservation.getRoom().getPrice().multiply(java.math.BigDecimal.valueOf(nights)));
        }

        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────
    // HELPER: Check if a room is already booked for given dates
    // ──────────────────────────────────────────────
    private boolean isRoomBooked(Long roomId, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        List<Reservation> existingBookings = reservationRepository.findAll()
                .stream()
                .filter(r -> r.getRoom() != null && r.getRoom().getId().equals(roomId))
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .filter(r -> r.getCheckIn().isBefore(checkOut) && r.getCheckOut().isAfter(checkIn))
                .collect(Collectors.toList());
        return !existingBookings.isEmpty();
    }

    // ──────────────────────────────────────────────
    // HELPER: Check if a hall is already booked for given dates
    // ──────────────────────────────────────────────
    private boolean isHallBooked(Long hallId, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        List<Reservation> existingBookings = reservationRepository.findAll()
                .stream()
                .filter(r -> r.getHall() != null && r.getHall().getId().equals(hallId))
                .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                .filter(r -> r.getCheckIn().isBefore(checkOut) && r.getCheckOut().isAfter(checkIn))
                .collect(Collectors.toList());
        return !existingBookings.isEmpty();
    }

    // ──────────────────────────────────────────────
    // HELPER: Convert Entity → Response DTO
    // ──────────────────────────────────────────────
    private ReservationResponse mapToResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setConfirmationCode(reservation.getConfirmationCode());
        response.setStatus(reservation.getStatus().name());
        response.setCheckIn(reservation.getCheckIn());
        response.setCheckOut(reservation.getCheckOut());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setCreatedAt(reservation.getCreatedAt());

        // Customer info
        if (reservation.getUser() != null) {
            response.setUserId(reservation.getUser().getId());
            response.setUserName(reservation.getUser().getName());
            response.setUserEmail(reservation.getUser().getEmail());
            response.setUserPhone(reservation.getUser().getPhoneNumber());
        }

        // Room info (if room booking)
        if (reservation.getRoom() != null) {
            response.setRoomId(reservation.getRoom().getId());
            response.setRoomNumber(reservation.getRoom().getRoomNumber());
            response.setRoomType(reservation.getRoom().getRoomType());
        }

        // Hall info (if hall booking)
        if (reservation.getHall() != null) {
            response.setHallId(reservation.getHall().getId());
            response.setHallName(reservation.getHall().getName());
        }

        // Package info (if package selected)
        if (reservation.getEventPackage() != null) {
            response.setPackageId(reservation.getEventPackage().getId());
            response.setPackageName(reservation.getEventPackage().getName());
        }

        return response;
    }
}

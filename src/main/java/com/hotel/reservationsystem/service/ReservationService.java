package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.ReservationRequest;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.entity.*;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
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

    // ──────────────────────────────────────────────
    // 1. CREATE A NEW RESERVATION
    // ──────────────────────────────────────────────
    public ReservationResponse createReservation(ReservationRequest request) {

        // Find the customer
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        // Validate: must book either a room OR a hall, not both
        if (request.getRoomId() != null && request.getHallId() != null) {
            throw new RuntimeException("Cannot book both a room and a hall in one reservation");
        }
        if (request.getRoomId() == null && request.getHallId() == null) {
            throw new RuntimeException("Must book either a room or a hall");
        }

        // Validate dates
        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // Build the reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());
        reservation.setStatus(ReservationStatus.PENDING);

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
    // 4. CANCEL A RESERVATION
    // ──────────────────────────────────────────────
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
        response.setStatus(reservation.getStatus().name());
        response.setCheckIn(reservation.getCheckIn());
        response.setCheckOut(reservation.getCheckOut());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setCreatedAt(reservation.getCreatedAt());

        // Customer info
        response.setUserId(reservation.getUser().getId());
        response.setUserName(reservation.getUser().getName());

        // Room info (if room booking)
        if (reservation.getRoom() != null) {
            response.setRoomNumber(reservation.getRoom().getRoomNumber());
            response.setRoomType(reservation.getRoom().getRoomType());
        }

        // Hall info (if hall booking)
        if (reservation.getHall() != null) {
            response.setHallName(reservation.getHall().getName());
        }

        // Package info (if package selected)
        if (reservation.getEventPackage() != null) {
            response.setPackageName(reservation.getEventPackage().getName());
        }

        return response;
    }
}

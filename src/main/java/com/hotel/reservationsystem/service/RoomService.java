// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomService.java
// LAYER: Service (Business Logic Layer)
//
// WHAT DOES THIS CLASS DO?
//   Implements the core business rules for hotel room management:
//     1. Adding new rooms with duplicate room number validation
//     2. Input validation for price, capacity, and room types
//     3. Updating room specifications and pricing
//     4. Updating availability status with occupancy guards
//     5. Safe room deletion with reservation foreign-key checks
//     6. Retrieving all rooms and filtering available rooms for guests
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.service;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// RoomRequest, RoomResponse – DTOs decoupling DB entities from the API layer.
// Room                    – JPA entity mapped to the "rooms" MySQL table.
// RoomStatus              – Enum: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE.
// ResourceNotFoundException – Custom 404 exception when a room ID doesn't exist.
// RoomRepository          – Spring Data JPA repository for room queries.
// ReservationRepository   – Checked to ensure rooms with reservations aren't deleted.
// @Service                – Marks this class as a Spring business service bean.
// @Transactional          – Manages database transactions (commit/rollback).
// @Autowired              – Injects repository dependencies automatically.
// BigDecimal              – Precise currency representation.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.RoomRequest;
import com.hotel.reservationsystem.dto.RoomResponse;
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.ReservationRepository;
import com.hotel.reservationsystem.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service // Spring service component containing business logic for UC-02.
public class RoomService {

    @Autowired // Injects room data access operations.
    private RoomRepository roomRepository;

    @Autowired // Injects reservation repo to check room booking constraints (Open Issue 1).
    private ReservationRepository reservationRepository;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE ROOM – Step 7, 8, 9 (Extension 5a, 7a, 8a)
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        // Validation (Extension 7a): Required fields check
        validateRoomRequest(request);

        // Extension 5a: Prevent duplicate room numbers
        String roomNumber = request.getRoomNumber().trim();
        if (roomRepository.existsByRoomNumber(roomNumber)) {
            throw new IllegalArgumentException("Room number '" + roomNumber + "' already exists. Please choose a unique room number.");
        }

        // Build and populate Room entity
        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setRoomType(request.getRoomType().trim());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity() != null ? request.getCapacity() : 2);
        room.setStatus(request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE);
        room.setDescription(request.getDescription());

        // Save to MySQL database via Spring Data JPA
        Room savedRoom = roomRepository.save(room);
        return RoomResponse.fromEntity(savedRoom);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL ROOMS – Step 4
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET ROOM BY ID – Step 6
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return RoomResponse.fromEntity(room);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. UPDATE ROOM – Step 7, 8, 9
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        validateRoomRequest(request);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        String newRoomNumber = request.getRoomNumber().trim();
        // Check if updating room number conflicts with another existing room
        if (!newRoomNumber.equalsIgnoreCase(room.getRoomNumber()) && roomRepository.existsByRoomNumber(newRoomNumber)) {
            throw new IllegalArgumentException("Room number '" + newRoomNumber + "' is already in use by another room.");
        }

        room.setRoomNumber(newRoomNumber);
        room.setRoomType(request.getRoomType().trim());
        room.setPricePerNight(request.getPricePerNight());
        if (request.getCapacity() != null) {
            room.setCapacity(request.getCapacity());
        }
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        room.setDescription(request.getDescription());

        Room updated = roomRepository.save(room);
        return RoomResponse.fromEntity(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. UPDATE ROOM STATUS – Step 10, 11 (Extension 10a)
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public RoomResponse updateRoomStatus(Long id, RoomStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Room status must be specified.");
        }

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        // Extension 10a: If a room is currently occupied or reserved, prevent accidental override to available
        if (room.getStatus() == RoomStatus.OCCUPIED && newStatus == RoomStatus.AVAILABLE) {
            throw new IllegalStateException("Room " + room.getRoomNumber() + " is currently OCCUPIED. Complete guest checkout before marking it AVAILABLE.");
        }

        room.setStatus(newStatus);
        Room updated = roomRepository.save(room);
        return RoomResponse.fromEntity(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. DELETE ROOM – Step 5 (Open Issue 1: Linked reservations check)
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        // Open Issue 1: Prevent deleting rooms linked to reservations
        if (reservationRepository.existsByRoom_Id(id)) {
            throw new IllegalStateException("Cannot delete room '" + room.getRoomNumber() + "' because it is linked to existing reservation records. Set status to MAINTENANCE instead.");
        }

        roomRepository.delete(room);
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. GET AVAILABLE ROOMS – Step 12 (For Customers & Receptionists)
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE).stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. GET ROOMS BY STATUS – Helper filter
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByStatus(RoomStatus status) {
        return roomRepository.findByStatus(status).stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIVATE VALIDATION HELPER – Extension 7a & 8a
    // ─────────────────────────────────────────────────────────────────
    private void validateRoomRequest(RoomRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Room data cannot be empty.");
        }
        if (request.getRoomNumber() == null || request.getRoomNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Room number is required.");
        }
        if (request.getRoomType() == null || request.getRoomType().trim().isEmpty()) {
            throw new IllegalArgumentException("Room type is required (e.g. Standard, Deluxe, Suite).");
        }
        if (request.getPricePerNight() == null || request.getPricePerNight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per night must be greater than zero.");
        }
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new IllegalArgumentException("Room guest capacity must be at least 1.");
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallService.java
// UC   : UC-03 – Manage Event Halls and Packages
// MEMBER: Panditharathne P. A. T. I. (IT25101982)
// LAYER: Service (Business Logic Layer)
//
// WHAT DOES THIS SERVICE DO?
//   Contains business rules, validations, and lifecycle operations for
//   hotel event halls. Enforces use-case rules:
//     - Extension 7a: Required hall information validation
//     - Extension 7b: Reserved hall availability protection
//     - Open Issue 1: Active reservation safety on deletion
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.service;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// EventHallRequest / Response – DTOs isolating DB entity from client API.
// EventHall                   – JPA entity mapping to "event_halls" MySQL table.
// ReservationStatus           – Enum to identify non-cancelled active bookings.
// EventHallRepository         – Spring Data JPA repository for hall persistence.
// ReservationRepository       – Injected to check active reservations (Ext 7b, Open Issue 1).
// ResourceNotFoundException   – Thrown when an ID does not exist in DB (returns 404).
// @Service                    – Marks this class as a Spring business service bean.
// @Transactional              – Manages database transaction boundaries (commit/rollback).
// @Autowired                  – Automatically injects dependency beans from Spring context.
// BigDecimal                  – For exact financial rate calculations without rounding errors.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.EventHallRequest;
import com.hotel.reservationsystem.dto.EventHallResponse;
import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.EventHallRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service // Spring IoC container instantiates and manages this service singleton
public class EventHallService {

    // ── DEPENDENCY INJECTIONS ────────────────────────────────────────────
    @Autowired
    private EventHallRepository eventHallRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    // ─────────────────────────────────────────────────────────────────
    // 1. CREATE EVENT HALL – Main Scenario Steps 5, 6, 7, 8
    // ─────────────────────────────────────────────────────────────────
    @Transactional // Commits on success, rolls back on runtime exception
    public EventHallResponse createEventHall(EventHallRequest request) {
        // Step 8 & Extension 7a: Validate required hall information
        validateHallRequest(request);

        String hallName = request.getName().trim();
        // Check for duplicate hall name
        if (eventHallRepository.existsByNameIgnoreCase(hallName)) {
            throw new IllegalArgumentException("An event hall named '" + hallName + "' already exists.");
        }

        // Build JPA Entity
        EventHall hall = new EventHall();
        hall.setName(hallName);
        hall.setPricePerEvent(request.getPricePerEvent());
        hall.setSeatingCapacity(request.getSeatingCapacity());
        hall.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);
        hall.setDescription(request.getDescription());

        // Persist to MySQL via JPA
        EventHall saved = eventHallRepository.save(hall);
        return EventHallResponse.fromEntity(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. GET ALL EVENT HALLS – Main Scenario Step 4
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true) // readOnly optimization: bypasses Hibernate dirty-checking
    public List<EventHallResponse> getAllEventHalls() {
        return eventHallRepository.findAll().stream()
                .map(EventHallResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET AVAILABLE EVENT HALLS – Main Scenario Step 12 (Customer View)
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<EventHallResponse> getAvailableEventHalls() {
        return eventHallRepository.findByAvailable(true).stream()
                .map(EventHallResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. GET EVENT HALL BY ID – Main Scenario Step 6
    // ─────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public EventHallResponse getEventHallById(Long id) {
        EventHall hall = eventHallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event hall not found with ID: " + id));
        return EventHallResponse.fromEntity(hall);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. UPDATE EVENT HALL – Main Scenario Steps 7 & 8
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public EventHallResponse updateEventHall(Long id, EventHallRequest request) {
        // Step 8 & Extension 7a: Validate incoming data
        validateHallRequest(request);

        EventHall existingHall = eventHallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event hall not found with ID: " + id));

        String newName = request.getName().trim();
        // Check if updating name conflicts with another hall
        if (!newName.equalsIgnoreCase(existingHall.getName()) && eventHallRepository.existsByNameIgnoreCase(newName)) {
            throw new IllegalArgumentException("An event hall named '" + newName + "' already exists.");
        }

        // Extension 7b: "If a hall is already reserved, the system prevents an incorrect availability update."
        boolean requestedAvailability = request.getAvailable() != null ? request.getAvailable() : existingHall.isAvailable();
        if (existingHall.isAvailable() && !requestedAvailability) {
            // Coordinator wants to set hall to unavailable: check if active reservations exist!
            boolean hasActiveBookings = reservationRepository.existsByHall_IdAndStatusNot(id, ReservationStatus.CANCELLED);
            if (hasActiveBookings) {
                throw new IllegalStateException("Hall '" + existingHall.getName() + "' is currently reserved in active bookings. Cannot update availability to unavailable.");
            }
        }

        existingHall.setName(newName);
        existingHall.setPricePerEvent(request.getPricePerEvent());
        existingHall.setSeatingCapacity(request.getSeatingCapacity());
        existingHall.setAvailable(requestedAvailability);
        existingHall.setDescription(request.getDescription());

        EventHall updated = eventHallRepository.save(existingHall);
        return EventHallResponse.fromEntity(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. TOGGLE / UPDATE HALL AVAILABILITY – Extension 7b
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public EventHallResponse updateAvailability(Long id, boolean available) {
        EventHall hall = eventHallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event hall not found with ID: " + id));

        // Extension 7b: Prevent marking unavailable if active reservations exist
        if (hall.isAvailable() && !available) {
            boolean hasActiveBookings = reservationRepository.existsByHall_IdAndStatusNot(id, ReservationStatus.CANCELLED);
            if (hasActiveBookings) {
                throw new IllegalStateException("Hall '" + hall.getName() + "' is currently reserved in active bookings. Cannot update availability.");
            }
        }

        hall.setAvailable(available);
        EventHall saved = eventHallRepository.save(hall);
        return EventHallResponse.fromEntity(saved);
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. DELETE EVENT HALL – Open Issue 1
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    public void deleteEventHall(Long id) {
        EventHall hall = eventHallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event hall not found with ID: " + id));

        // Open Issue 1: "The detailed rules for handling existing reservations when a hall or package is removed..."
        // Business Rule: Prevent deletion if any active or past reservation records reference this hall.
        boolean hasLinkedReservations = reservationRepository.existsByHall_Id(id);
        if (hasLinkedReservations) {
            throw new IllegalStateException("Cannot delete Event Hall '" + hall.getName() + "' because it is linked to existing reservation records. Consider marking it unavailable instead.");
        }

        eventHallRepository.delete(hall);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Validate Hall Request Data (Extension 7a)
    // ─────────────────────────────────────────────────────────────────
    private void validateHallRequest(EventHallRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Event hall request cannot be null.");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Event hall name is required.");
        }
        if (request.getPricePerEvent() == null || request.getPricePerEvent().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Event hall price must be greater than zero.");
        }
        if (request.getSeatingCapacity() == null || request.getSeatingCapacity() <= 0) {
            throw new IllegalArgumentException("Seating capacity must be at least 1 guest.");
        }
    }
}

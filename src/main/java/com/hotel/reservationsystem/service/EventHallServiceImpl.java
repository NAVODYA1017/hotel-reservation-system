package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.EventHallRequest;
import com.hotel.reservationsystem.dto.EventHallResponse;
import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.EventHallRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventHallServiceImpl implements EventHallService {

    private final EventHallRepository eventHallRepository;
    private final ReservationRepository reservationRepository;

    public EventHallServiceImpl(
            EventHallRepository eventHallRepository,
            ReservationRepository reservationRepository) {

        this.eventHallRepository = eventHallRepository;
        this.reservationRepository = reservationRepository;
    }


    // =========================================================
    // CREATE EVENT HALL
    // =========================================================

    @Override
    @Transactional
    public EventHallResponse createEventHall(
            EventHallRequest request) {

        validateHallRequest(request);

        String hallName = request.getName().trim();

        // Prevent duplicate hall names
        if (eventHallRepository.existsByNameIgnoreCase(hallName)) {
            throw new IllegalArgumentException(
                    "An event hall named '" + hallName
                            + "' already exists."
            );
        }

        // Create EventHall entity
        EventHall hall = new EventHall();

        hall.setName(hallName);
        hall.setPricePerEvent(request.getPricePerEvent());
        hall.setSeatingCapacity(request.getSeatingCapacity());

        // Make the hall available by default
        // if availability is not provided.
        hall.setAvailable(
                request.getAvailable() != null
                        ? request.getAvailable()
                        : true
        );

        hall.setDescription(request.getDescription());

        // Save to database
        EventHall saved = eventHallRepository.save(hall);

        // Entity → Response DTO
        return EventHallResponse.fromEntity(saved);
    }


    // =========================================================
    // GET ALL EVENT HALLS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<EventHallResponse> getAllEventHalls() {

        return eventHallRepository.findAll()
                .stream()
                .map(EventHallResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET AVAILABLE EVENT HALLS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<EventHallResponse> getAvailableEventHalls() {

        return eventHallRepository
                .findByAvailable(true)
                .stream()
                .map(EventHallResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET EVENT HALL BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public EventHallResponse getEventHallById(Long id) {

        EventHall hall =
                eventHallRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event hall not found with ID: "
                                                + id
                                )
                        );

        return EventHallResponse.fromEntity(hall);
    }


    // =========================================================
    // UPDATE EVENT HALL
    // =========================================================

    @Override
    @Transactional
    public EventHallResponse updateEventHall(
            Long id,
            EventHallRequest request) {

        validateHallRequest(request);

        // Find existing hall
        EventHall existingHall =
                eventHallRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event hall not found with ID: "
                                                + id
                                )
                        );

        String newName =
                request.getName().trim();

        // Prevent duplicate names when changing the name
        if (!newName.equalsIgnoreCase(existingHall.getName())
                && eventHallRepository
                .existsByNameIgnoreCase(newName)) {

            throw new IllegalArgumentException(
                    "An event hall named '" + newName
                            + "' already exists."
            );
        }


        // Determine requested availability
        boolean requestedAvailability =
                request.getAvailable() != null
                        ? request.getAvailable()
                        : existingHall.isAvailable();


        // If changing from available → unavailable,
        // check for active reservations.
        if (existingHall.isAvailable()
                && !requestedAvailability) {

            boolean hasActiveBookings =
                    reservationRepository
                            .existsByHall_IdAndStatusNot(
                                    id,
                                    ReservationStatus.CANCELLED
                            );

            if (hasActiveBookings) {

                throw new IllegalStateException(
                        "Hall '" + existingHall.getName()
                                + "' is currently reserved in active "
                                + "bookings. Cannot update availability "
                                + "to unavailable."
                );
            }
        }


        // Update entity
        existingHall.setName(newName);

        existingHall.setPricePerEvent(
                request.getPricePerEvent()
        );

        existingHall.setSeatingCapacity(
                request.getSeatingCapacity()
        );

        existingHall.setAvailable(
                requestedAvailability
        );

        existingHall.setDescription(
                request.getDescription()
        );


        // Save updated entity
        EventHall updated =
                eventHallRepository.save(existingHall);

        return EventHallResponse.fromEntity(updated);
    }


    // =========================================================
    // UPDATE HALL AVAILABILITY
    // =========================================================

    @Override
    @Transactional
    public EventHallResponse updateAvailability(
            Long id,
            boolean available) {

        EventHall hall =
                eventHallRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event hall not found with ID: "
                                                + id
                                )
                        );


        // Prevent making a reserved hall unavailable
        if (hall.isAvailable() && !available) {

            boolean hasActiveBookings =
                    reservationRepository
                            .existsByHall_IdAndStatusNot(
                                    id,
                                    ReservationStatus.CANCELLED
                            );

            if (hasActiveBookings) {

                throw new IllegalStateException(
                        "Hall '" + hall.getName()
                                + "' is currently reserved in active "
                                + "bookings. Cannot update availability."
                );
            }
        }


        hall.setAvailable(available);

        EventHall saved =
                eventHallRepository.save(hall);

        return EventHallResponse.fromEntity(saved);
    }


    // =========================================================
    // DELETE EVENT HALL
    // =========================================================

    @Override
    @Transactional
    public void deleteEventHall(Long id) {

        EventHall hall =
                eventHallRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event hall not found with ID: "
                                                + id
                                )
                        );


        // Do not delete a hall that is linked
        // to reservation records.
        boolean hasLinkedReservations =
                reservationRepository
                        .existsByHall_Id(id);

        if (hasLinkedReservations) {

            throw new IllegalStateException(
                    "Cannot delete Event Hall '"
                            + hall.getName()
                            + "' because it is linked to existing "
                            + "reservation records. Consider marking "
                            + "it unavailable instead."
            );
        }


        eventHallRepository.delete(hall);
    }


    // =========================================================
    // VALIDATE EVENT HALL REQUEST
    // =========================================================

    private void validateHallRequest(
            EventHallRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Event hall request cannot be null."
            );
        }


        if (request.getName() == null
                || request.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Event hall name is required."
            );
        }


        if (request.getPricePerEvent() == null
                || request.getPricePerEvent()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Event hall price must be greater than zero."
            );
        }


        if (request.getSeatingCapacity() == null
                || request.getSeatingCapacity() <= 0) {

            throw new IllegalArgumentException(
                    "Seating capacity must be at least 1 guest."
            );
        }
    }
}
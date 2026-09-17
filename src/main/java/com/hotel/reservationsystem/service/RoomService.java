package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.entity.Venue;
import com.hotel.reservationsystem.repository.VenueRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Major Function: Room Management
 * Owner: Akmal (Room Management module)
 */
@Service
public class RoomService {

    private final VenueRepository venueRepository;

    public RoomService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public List<Venue> searchRooms(int minCapacity) {
        return venueRepository.findByActiveTrueAndCapacityGreaterThanEqual(minCapacity);
    }

    public List<Venue> getAllRooms() {
        return venueRepository.findByActiveTrue();
    }

    public Venue createRoom(Venue venue) {
        return venueRepository.save(venue);
    }

    public Venue updateRoom(Long venueId, Venue updated) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        venue.setHallName(updated.getHallName());
        venue.setCapacity(updated.getCapacity());
        venue.setDescription(updated.getDescription());
        return venueRepository.save(venue);
    }

    /** Sub-function: retire a room instead of deleting it (preserves booking history). */
    public Venue deactivateRoom(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        venue.setActive(false);
        return venueRepository.save(venue);
    }

    /** Sub-function: permanently remove a room row (hard delete). */
    public void deleteRoom(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new IllegalArgumentException("Room not found");
        }
        venueRepository.deleteById(venueId);
    }
}

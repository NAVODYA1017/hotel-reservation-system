package com.sliit.se2030.hotel.room;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

/**
 * Room Management Service
 * Handles CRUD operations for Room, RoomType, and RoomAvailability entities
 */
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomAvailabilityRepository roomAvailabilityRepository;
    private final VenueRepository venueRepository;

    public RoomService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository,
                       RoomAvailabilityRepository roomAvailabilityRepository, VenueRepository venueRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomAvailabilityRepository = roomAvailabilityRepository;
        this.venueRepository = venueRepository;
    }

    // ========== ROOM TYPE OPERATIONS ==========
    
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public RoomType createRoomType(RoomType roomType) {
        if (roomTypeRepository.existsByTypeName(roomType.getTypeName())) {
            throw new IllegalArgumentException("Room type already exists");
        }
        return roomTypeRepository.save(roomType);
    }

    public RoomType updateRoomType(Integer roomTypeId, RoomType updated) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Room type not found"));
        roomType.setTypeName(updated.getTypeName());
        return roomTypeRepository.save(roomType);
    }

    public void deleteRoomType(Integer roomTypeId) {
        if (!roomTypeRepository.existsById(roomTypeId)) {
            throw new IllegalArgumentException("Room type not found");
        }
        roomTypeRepository.deleteById(roomTypeId);
    }

    // ========== ROOM OPERATIONS ==========
    
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByType(Integer roomTypeId) {
        return roomRepository.findByRoomTypeId(roomTypeId);
    }

    public List<Room> getRoomsByStatus(String status) {
        return roomRepository.findByStatus(status);
    }

    public List<Room> getRoomsByFloor(Integer floor) {
        return roomRepository.findByFloor(floor);
    }

    public Room getRoomById(Integer roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    @Transactional
    public Room createRoom(Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists");
        }
        if (!roomTypeRepository.existsById(room.getRoomTypeId())) {
            throw new IllegalArgumentException("Room type not found");
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Integer roomId, Room updated) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        
        if (!room.getRoomNumber().equals(updated.getRoomNumber()) && 
            roomRepository.existsByRoomNumber(updated.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists");
        }
        
        if (!roomTypeRepository.existsById(updated.getRoomTypeId())) {
            throw new IllegalArgumentException("Room type not found");
        }
        
        room.setRoomTypeId(updated.getRoomTypeId());
        room.setRoomNumber(updated.getRoomNumber());
        room.setFloor(updated.getFloor());
        room.setPrice(updated.getPrice());
        room.setStatus(updated.getStatus());
        
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Integer roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Room not found");
        }
        roomAvailabilityRepository.deleteByRoomId(roomId);
        roomRepository.deleteById(roomId);
    }

    // ========== ROOM AVAILABILITY OPERATIONS ==========
    
    public List<RoomAvailability> getRoomAvailability(Integer roomId) {
        return roomAvailabilityRepository.findByRoomId(roomId);
    }

    public RoomAvailability getRoomAvailabilityByDate(Integer roomId, java.time.LocalDate date) {
        return roomAvailabilityRepository.findByRoomIdAndDate(roomId, date)
                .orElse(null);
    }

    @Transactional
    public RoomAvailability setRoomAvailability(Integer roomId, java.time.LocalDate date, 
                                                  Boolean available, BigDecimal dailyRate) {
        if (!roomRepository.existsById(roomId)) {
            throw new IllegalArgumentException("Room not found");
        }
        
        RoomAvailability availability = roomAvailabilityRepository.findByRoomIdAndDate(roomId, date)
                .orElse(new RoomAvailability(roomId, date, available, dailyRate));
        
        availability.setAvailable(available);
        availability.setDailyRate(dailyRate);
        
        return roomAvailabilityRepository.save(availability);
    }

    // ========== LEGACY VENUE OPERATIONS (for backward compatibility) ==========
    
    public List<Venue> searchVenues(int minCapacity) {
        return venueRepository.findByActiveTrueAndCapacityGreaterThanEqual(minCapacity);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findByActiveTrue();
    }

    public Venue createVenue(Venue venue) {
        return venueRepository.save(venue);
    }

    public Venue updateVenue(Long venueId, Venue updated) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        venue.setHallName(updated.getHallName());
        venue.setCapacity(updated.getCapacity());
        venue.setDescription(updated.getDescription());
        venue.setImageUrl(updated.getImageUrl());
        return venueRepository.save(venue);
    }

    public Venue deactivateVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        venue.setActive(false);
        return venueRepository.save(venue);
    }

    public void deleteVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new IllegalArgumentException("Venue not found");
        }
        venueRepository.deleteById(venueId);
    }
}
package com.sliit.se2030.hotel.room;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

/**
 * Room Management API Controller
 * Handles CRUD for Room, RoomType, and RoomAvailability entities
 * Also maintains legacy Venue endpoints for backward compatibility
 */
@RestController
@RequestMapping("/api")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // ========== ROOM TYPE ENDPOINTS ==========
    
    @GetMapping("/room-types")
    public List<RoomType> getAllRoomTypes() {
        return roomService.getAllRoomTypes();
    }

    @PostMapping("/room-types")
    public RoomType createRoomType(@RequestBody RoomType roomType) {
        return roomService.createRoomType(roomType);
    }

    @PutMapping("/room-types/{roomTypeId}")
    public RoomType updateRoomType(@PathVariable Integer roomTypeId, @RequestBody RoomType roomType) {
        return roomService.updateRoomType(roomTypeId, roomType);
    }

    @DeleteMapping("/room-types/{roomTypeId}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Integer roomTypeId) {
        roomService.deleteRoomType(roomTypeId);
        return ResponseEntity.noContent().build();
    }

    // ========== ROOM ENDPOINTS ==========
    
    @GetMapping("/rooms")
    public List<Room> getAllRooms(
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer floor) {
        if (roomTypeId != null) {
            return roomService.getRoomsByType(roomTypeId);
        }
        if (status != null) {
            return roomService.getRoomsByStatus(status);
        }
        if (floor != null) {
            return roomService.getRoomsByFloor(floor);
        }
        return roomService.getAllRooms();
    }

    @GetMapping("/rooms/{roomId}")
    public Room getRoomById(@PathVariable Integer roomId) {
        return roomService.getRoomById(roomId);
    }

    @PostMapping("/rooms")
    public Room createRoom(@RequestBody Room room) {
        return roomService.createRoom(room);
    }

    @PutMapping("/rooms/{roomId}")
    public Room updateRoom(@PathVariable Integer roomId, @RequestBody Room room) {
        return roomService.updateRoom(roomId, room);
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    // ========== ROOM AVAILABILITY ENDPOINTS ==========
    
    @GetMapping("/rooms/{roomId}/availability")
    public List<RoomAvailability> getRoomAvailability(@PathVariable Integer roomId) {
        return roomService.getRoomAvailability(roomId);
    }

    @PostMapping("/rooms/{roomId}/availability")
    public RoomAvailability setRoomAvailability(
            @PathVariable Integer roomId,
            @RequestParam java.time.LocalDate date,
            @RequestParam Boolean available,
            @RequestParam java.math.BigDecimal dailyRate) {
        return roomService.setRoomAvailability(roomId, date, available, dailyRate);
    }

    // ========== LEGACY VENUE ENDPOINTS (for backward compatibility) ==========
    
    @GetMapping("/venues")
    public List<Venue> searchVenues(@RequestParam(defaultValue = "0") int minCapacity) {
        return roomService.searchVenues(minCapacity);
    }

    @PostMapping("/venues")
    public Venue createVenue(@RequestBody Venue venue) {
        return roomService.createVenue(venue);
    }

    @PutMapping("/venues/{venueId}")
    public Venue updateVenue(@PathVariable Long venueId, @RequestBody Venue venue) {
        return roomService.updateVenue(venueId, venue);
    }

    @PutMapping("/venues/{venueId}/deactivate")
    public Venue deactivateVenue(@PathVariable Long venueId) {
        return roomService.deactivateVenue(venueId);
    }

    @DeleteMapping("/venues/{venueId}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long venueId) {
        roomService.deleteVenue(venueId);
        return ResponseEntity.noContent().build();
    }
}
package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.entity.Venue;
import com.hotel.reservationsystem.service.RoomService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Major Function: Room Management
 * Owner: Akmal (Room Management module)
 */
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Venue> searchRooms(@RequestParam(defaultValue = "0") int minCapacity) {
        return roomService.searchRooms(minCapacity);
    }

    @PostMapping
    public Venue createRoom(@RequestBody Venue venue) {
        return roomService.createRoom(venue);
    }

    @PutMapping("/{venueId}")
    public Venue updateRoom(@PathVariable Long venueId, @RequestBody Venue venue) {
        return roomService.updateRoom(venueId, venue);
    }

    @PutMapping("/{venueId}/deactivate")
    public Venue deactivateRoom(@PathVariable Long venueId) {
        return roomService.deactivateRoom(venueId);
    }

    @DeleteMapping("/{venueId}")
    public void deleteRoom(@PathVariable Long venueId) {
        roomService.deleteRoom(venueId);
    }
}

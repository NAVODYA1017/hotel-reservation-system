// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomController.java
// LAYER: Controller (REST API layer – maps HTTP requests to RoomService)
//
// WHAT DOES THIS CONTROLLER DO?
//   Exposes RESTful endpoints for Receptionists and Customers:
//     - POST   /api/rooms               → Add a new room
//     - GET    /api/rooms               → List all rooms
//     - GET    /api/rooms/{id}          → View one room
//     - PUT    /api/rooms/{id}          → Update room details
//     - PUT    /api/rooms/{id}/status   → Change availability status
//     - DELETE /api/rooms/{id}          → Delete a room
//     - GET    /api/rooms/available     → List currently available rooms
//     - GET    /api/rooms/status/{status} → Filter rooms by status
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// RoomRequest, RoomResponse – DTOs preventing direct exposure of the JPA entity.
// RoomStatus              – Enum for room status (AVAILABLE, MAINTENANCE, etc.).
// RoomService             – Service containing business rules and validations.
// @RestController         – Tells Spring every method returns JSON response data.
// @RequestMapping         – Base URL path prefix for all endpoints in this class.
// @GetMapping, @PostMapping, @PutMapping, @DeleteMapping – Standard HTTP verbs.
// @PathVariable           – Extracts parameters from the URL path (/api/rooms/{id}).
// @RequestBody            – Deserializes incoming JSON payload into RoomRequest DTO.
// ResponseEntity          – Encapsulates HTTP status code and body.
// HttpStatus              – Enum of standard HTTP status codes (200 OK, 201 CREATED, etc.).
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.RoomRequest;
import com.hotel.reservationsystem.dto.RoomResponse;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired // Dependency injection of RoomService business layer bean.
    private RoomService roomService;

    // ─────────────────────────────────────────────────────────────────
    // 1. ADD NEW ROOM – POST /api/rooms
    // ─────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. LIST ALL ROOMS – GET /api/rooms
    // ─────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. GET AVAILABLE ROOMS – GET /api/rooms/available
    //    Placed BEFORE /{id} so Spring doesn't interpret "available" as an ID!
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms() {
        List<RoomResponse> rooms = roomService.getAvailableRooms();
        return ResponseEntity.ok(rooms);
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. FILTER BY STATUS – GET /api/rooms/status/{status}
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RoomResponse>> getRoomsByStatus(@PathVariable RoomStatus status) {
        List<RoomResponse> rooms = roomService.getRoomsByStatus(status);
        return ResponseEntity.ok(rooms);
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. VIEW ONE ROOM BY ID – GET /api/rooms/{id}
    // ─────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        RoomResponse response = roomService.getRoomById(id);
        return ResponseEntity.ok(response);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. UPDATE ROOM DETAILS – PUT /api/rooms/{id}
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long id,
            @RequestBody RoomRequest request) {
        RoomResponse updated = roomService.updateRoom(id, request);
        return ResponseEntity.ok(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. CHANGE ROOM STATUS – PUT /api/rooms/{id}/status
    //    Body can be { "status": "MAINTENANCE" } or plain query/JSON
    // ─────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<RoomResponse> updateRoomStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusBody) {
        String statusStr = statusBody.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Status value is required.");
        }
        RoomStatus newStatus = RoomStatus.valueOf(statusStr.trim().toUpperCase());
        RoomResponse updated = roomService.updateRoomStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. DELETE A ROOM – DELETE /api/rooms/{id}
    // ─────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(Map.of("message", "Room with ID " + id + " has been successfully deleted."));
    }
}

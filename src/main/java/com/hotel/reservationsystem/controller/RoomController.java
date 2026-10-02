// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomController.java
// UC   : UC-02 – Manage Hotel Rooms
// LAYER: Controller (REST API layer – receives HTTP requests from the
//        React frontend and delegates business logic to the service/repository)
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// Room             – The JPA entity class that maps to the "rooms" table in MySQL.
// RoomRepository   – Spring Data JPA interface that provides built-in CRUD
//                    methods (findAll, findById, save, deleteById) without
//                    writing any SQL.
// @Autowired       – Tells Spring to automatically inject (provide) an instance
//                    of the required dependency (RoomRepository) at runtime.
//                    This is called "Dependency Injection" (DI).
// @RestController  – Combines @Controller + @ResponseBody. It tells Spring that
//                    every method in this class returns data (JSON) directly,
//                    NOT a view/HTML page.
// @RequestMapping  – Sets a base URL path for all endpoints in this controller.
// @GetMapping      – Maps HTTP GET requests to a method.
// @PostMapping     – Maps HTTP POST requests to a method (used for CREATE).
// @PutMapping      – Maps HTTP PUT requests to a method (used for UPDATE).
// @DeleteMapping   – Maps HTTP DELETE requests to a method (used for DELETE).
// @PathVariable    – Binds a value from the URL path (e.g. /api/rooms/5 → id=5)
//                    to a method parameter.
// @RequestBody     – Tells Spring to deserialize (convert) the incoming JSON
//                    request body into a Java object.
// ResponseEntity   – Lets us control the full HTTP response: status code,
//                    headers, and body.
// HttpStatus       – Enum of HTTP status codes (200 OK, 201 CREATED, 404 NOT FOUND, etc.).
// List             – Java collection interface for ordered lists of elements.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// @RestController – marks this class as a REST API controller.
//   → Every public method returns JSON data, not an HTML page.
//   → Spring automatically serializes return values to JSON using Jackson.
@RestController

// @RequestMapping("/api/rooms") – all endpoints in this controller start with /api/rooms
//   → e.g. GET /api/rooms, POST /api/rooms, GET /api/rooms/5
@RequestMapping("/api/rooms")
public class RoomController {

    // @Autowired – Spring automatically injects the RoomRepository bean here.
    //   → We do NOT create it with "new RoomRepository()".
    //   → Spring creates and manages the lifecycle of all beans (Inversion of Control).
    @Autowired
    private RoomRepository roomRepository;

    // ══════════════════════════════════════════════════════════════════════
    // 1. CREATE – Add a new room to the database
    //    HTTP: POST http://localhost:8080/api/rooms
    //    Body: { "roomNumber": "103", "roomType": "Suite", "pricePerNight": 25000.00,
    //            "status": "AVAILABLE", "description": "Ocean view suite", "capacity": 3 }
    //    Response: 201 CREATED + the saved room object as JSON
    // ══════════════════════════════════════════════════════════════════════
    @PostMapping  // Maps POST requests to this method
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        // @RequestBody – Spring reads the JSON from the request body and
        //   converts it into a Room Java object (deserialization).
        // roomRepository.save(room) – JPA's save() method:
        //   → If the entity has NO id (or id = null), it performs an INSERT (create).
        //   → If the entity HAS an id, it performs an UPDATE.
        //   → Returns the saved entity with the auto-generated id populated.
        Room savedRoom = roomRepository.save(room);

        // ResponseEntity.status(HttpStatus.CREATED) – returns HTTP 201 (Created)
        //   instead of the default 200 (OK), which is the correct status for
        //   resource creation as per REST best practices.
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. READ ALL – Retrieve every room from the database
    //    HTTP: GET http://localhost:8080/api/rooms
    //    Response: 200 OK + JSON array of all rooms
    // ══════════════════════════════════════════════════════════════════════
    @GetMapping  // Maps GET requests (no path suffix) to this method
    public List<Room> getAllRooms() {
        // roomRepository.findAll() – JPA's built-in method that executes:
        //   SELECT * FROM rooms;
        //   → Returns a List<Room> containing every row in the rooms table.
        return roomRepository.findAll();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. READ ONE – Retrieve a single room by its primary key (id)
    //    HTTP: GET http://localhost:8080/api/rooms/5
    //    Response: 200 OK + the room JSON, or 404 NOT FOUND if id doesn't exist
    // ══════════════════════════════════════════════════════════════════════
    @GetMapping("/{id}")  // {id} is a path variable – value comes from the URL
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        // @PathVariable – extracts the {id} value from the URL.
        //   e.g. GET /api/rooms/5 → id = 5
        // roomRepository.findById(id) – JPA's built-in method that executes:
        //   SELECT * FROM rooms WHERE id = ?;
        //   → Returns an Optional<Room> (may or may not contain a value).
        // .map(ResponseEntity::ok) – if found, wrap it in HTTP 200 OK.
        // .orElse(ResponseEntity.notFound().build()) – if NOT found, return HTTP 404.
        return roomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. UPDATE – Modify an existing room's details
    //    HTTP: PUT http://localhost:8080/api/rooms/5
    //    Body: { "roomNumber": "103", "roomType": "Suite", "pricePerNight": 28000.00,
    //            "status": "MAINTENANCE", "description": "Renovated suite", "capacity": 4 }
    //    Response: 200 OK + the updated room JSON, or 404 NOT FOUND
    // ══════════════════════════════════════════════════════════════════════
    @PutMapping("/{id}")  // Maps PUT requests to /api/rooms/{id}
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        // First, check if the room exists in the database.
        return roomRepository.findById(id)
                .map(existingRoom -> {
                    // Update only the fields that were sent in the request body.
                    // existingRoom is the current database record.
                    existingRoom.setRoomNumber(roomDetails.getRoomNumber());
                    existingRoom.setRoomType(roomDetails.getRoomType());
                    existingRoom.setPricePerNight(roomDetails.getPricePerNight());
                    existingRoom.setStatus(roomDetails.getStatus());
                    existingRoom.setDescription(roomDetails.getDescription());
                    existingRoom.setCapacity(roomDetails.getCapacity());

                    // roomRepository.save(existingRoom) – because existingRoom already
                    //   has an id, JPA performs an UPDATE (not an INSERT).
                    Room updatedRoom = roomRepository.save(existingRoom);
                    return ResponseEntity.ok(updatedRoom);
                })
                // If findById returned empty, return 404 Not Found.
                .orElse(ResponseEntity.notFound().build());
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5. DELETE – Remove a room from the database
    //    HTTP: DELETE http://localhost:8080/api/rooms/5
    //    Response: 204 NO CONTENT (success, nothing to return), or 404 NOT FOUND
    // ══════════════════════════════════════════════════════════════════════
    @DeleteMapping("/{id}")  // Maps DELETE requests to /api/rooms/{id}
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        // Check if the room exists before attempting to delete.
        if (roomRepository.existsById(id)) {
            // roomRepository.deleteById(id) – JPA's built-in method that executes:
            //   DELETE FROM rooms WHERE id = ?;
            roomRepository.deleteById(id);
            // HTTP 204 No Content – standard response for successful DELETE.
            //   → The resource has been deleted, so there's no body to return.
            return ResponseEntity.noContent().build();
        }
        // Room with this id doesn't exist → return HTTP 404 Not Found.
        return ResponseEntity.notFound().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 6. FILTER – Get rooms filtered by status (AVAILABLE, OCCUPIED, MAINTENANCE)
    //    HTTP: GET http://localhost:8080/api/rooms/status/AVAILABLE
    //    Response: 200 OK + JSON array of matching rooms
    // ══════════════════════════════════════════════════════════════════════
    @GetMapping("/status/{status}")
    public List<Room> getRoomsByStatus(@PathVariable RoomStatus status) {
        // Filter rooms from the database by their status.
        // Uses Java Streams to filter the list in memory.
        // stream() – converts the List to a Stream for functional-style processing.
        // filter() – keeps only elements that match the condition.
        // toList() – collects the filtered results back into a List.
        return roomRepository.findAll().stream()
                .filter(room -> room.getStatus() == status)
                .toList();
    }
}

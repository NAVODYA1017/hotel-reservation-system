// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallController.java
// LAYER: Controller (Presentation / REST API Layer)
//
// WHAT DOES THIS CONTROLLER DO?
//   Exposes REST endpoints for the management and customer browsing
//   of hotel event halls:
//     - POST   /api/event-halls              → Create a new event hall
//     - GET    /api/event-halls              → List all halls
//     - GET    /api/event-halls/available    → List available halls
//     - GET    /api/event-halls/{id}         → View single hall details
//     - PUT    /api/event-halls/{id}         → Update hall information
//     - PATCH  /api/event-halls/{id}/availability → Toggle availability
//     - DELETE /api/event-halls/{id}         → Delete hall
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.controller;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// EventHallRequest / Response – DTOs for safe JSON communication.
// EventHallService            – Injected service carrying business logic.
// @RestController             – Combines @Controller and @ResponseBody (returns JSON).
// @RequestMapping             – Base path prefix for all endpoints in this controller.
// @CrossOrigin                – Permits CORS requests from frontend Vite server.
// @Autowired                  – Spring dependency injection for the service layer.
// ResponseEntity              – Encapsulates HTTP status codes, headers, and body.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.dto.EventHallRequest;
import com.hotel.reservationsystem.dto.EventHallResponse;
import com.hotel.reservationsystem.service.EventHallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/event-halls", "/api/halls"})
public class EventHallController {

    @Autowired
    private EventHallService eventHallService;


    @PostMapping
    public ResponseEntity<EventHallResponse> createEventHall(@RequestBody EventHallRequest request) {
        EventHallResponse response = eventHallService.createEventHall(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @GetMapping
    public ResponseEntity<List<EventHallResponse>> getAllEventHalls() {
        List<EventHallResponse> halls = eventHallService.getAllEventHalls();
        return ResponseEntity.ok(halls);
    }


    @GetMapping("/available")
    public ResponseEntity<List<EventHallResponse>> getAvailableEventHalls() {
        List<EventHallResponse> availableHalls = eventHallService.getAvailableEventHalls();
        return ResponseEntity.ok(availableHalls);
    }


    @GetMapping("/{id}")
    public ResponseEntity<EventHallResponse> getEventHallById(@PathVariable Long id) {
        EventHallResponse hall = eventHallService.getEventHallById(id);
        return ResponseEntity.ok(hall);
    }


    @PutMapping("/{id}")
    public ResponseEntity<EventHallResponse> updateEventHall(
            @PathVariable Long id,
            @RequestBody EventHallRequest request) {
        EventHallResponse updated = eventHallService.updateEventHall(id, request);
        return ResponseEntity.ok(updated);
    }


    @PatchMapping("/{id}/availability")
    public ResponseEntity<EventHallResponse> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean available = body.getOrDefault("available", true);
        EventHallResponse response = eventHallService.updateAvailability(id, available);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventHall(@PathVariable Long id) {
        eventHallService.deleteEventHall(id);
        return ResponseEntity.noContent().build();
    }
}

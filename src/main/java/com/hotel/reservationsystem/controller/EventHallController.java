
package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.EventHallRequest;
import com.hotel.reservationsystem.dto.EventHallResponse;
import com.hotel.reservationsystem.service.EventHallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController //combine @controller & @responsebody and return json
@RequestMapping({"/api/event-halls", "/api/halls"}) //base path prefix for all endpoints
public class EventHallController {

    @Autowired // spring annot for dep injection
    private EventHallService eventHallService;


    // @ReqBody --> turn http req body into java object
    @PostMapping //http post req --> create
    public ResponseEntity<EventHallResponse> createEventHall(@RequestBody EventHallRequest request) {
        EventHallResponse response = eventHallService.createEventHall(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED); //201
    }


    //ResponseEntity - response data + status code
    @GetMapping //retrieve data
    public ResponseEntity<List<EventHallResponse>> getAllEventHalls() {
        List<EventHallResponse> halls = eventHallService.getAllEventHalls();
        return ResponseEntity.ok(halls); //200 ok
    }


    @GetMapping("/available")
    public ResponseEntity<List<EventHallResponse>> getAvailableEventHalls() {
        List<EventHallResponse> availableHalls = eventHallService.getAvailableEventHalls();
        return ResponseEntity.ok(availableHalls);
    }

    // @PathVar - get val directly from url

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


    //patchmapping - update only specific property
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
        return ResponseEntity.noContent().build(); //204 no content  .build() - creates final respEntity
    }
}

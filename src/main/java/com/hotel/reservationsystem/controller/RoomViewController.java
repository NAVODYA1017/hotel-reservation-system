package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.entity.Venue;
import com.hotel.reservationsystem.repository.VenueRepository;
import com.hotel.reservationsystem.service.RoomService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

/**
 * Major Function: Room Management
 * Owner: Akmal (Room Management module)
 * Serves the HTML pages for browsing rooms/venues.
 */
@Controller
public class RoomViewController {

    private final RoomService roomService;
    private final VenueRepository venueRepository;

    public RoomViewController(RoomService roomService, VenueRepository venueRepository) {
        this.roomService = roomService;
        this.venueRepository = venueRepository;
    }

    @GetMapping("/venues")
    public String listVenues(@RequestParam(required = false) Integer minCapacity, Model model) {
        int min = minCapacity == null ? 0 : minCapacity;
        model.addAttribute("venues", roomService.searchRooms(min));
        model.addAttribute("minCapacity", minCapacity);
        return "room/venues";
    }

    @GetMapping("/venues/{venueId}")
    public String viewVenue(@PathVariable Long venueId, Model model) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        model.addAttribute("venue", venue);
        return "room/venue-detail";
    }
}

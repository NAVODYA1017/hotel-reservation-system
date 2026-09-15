package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    // GET all rooms (for testing UI)
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
}

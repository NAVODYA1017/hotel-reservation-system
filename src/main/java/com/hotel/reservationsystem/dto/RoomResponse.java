// ═══════════════════════════════════════════════════════════════════════
// FILE : RoomResponse.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS THIS CLASS?
//   RoomResponse is the standardized payload returned to the frontend
//   when listing rooms, viewing room details, or confirming creation/update.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data                // Lombok: generates getters, setters, equals, hashCode, toString.
@NoArgsConstructor   // Lombok: generates default constructor for JSON serialization.
@AllArgsConstructor  // Lombok: generates all-args constructor.
@Builder             // Lombok: provides Builder design pattern.
public class RoomResponse {

    private Long id;
    private String roomNumber;
    private String roomType;
    private BigDecimal pricePerNight;
    private int capacity;
    private RoomStatus status;
    private String description;

    // Static factory method to convert a JPA Room entity into a RoomResponse DTO.
    public static RoomResponse fromEntity(Room room) {
        if (room == null) return null;
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .status(room.getStatus())
                .description(room.getDescription())
                .build();
    }
}

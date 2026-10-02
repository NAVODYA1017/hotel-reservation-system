package com.sliit.se2030.hotel.room;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Room Type Entity
 * Maps to room_type table
 */
@Entity
@Table(name = "room_type")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomTypeId;

    @NotBlank
    @Column(unique = true, length = 100)
    private String typeName;

    public RoomType() {}

    public RoomType(String typeName) {
        this.typeName = typeName;
    }

    public Integer getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Integer roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }
}

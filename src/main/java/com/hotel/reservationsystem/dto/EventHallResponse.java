// ═══════════════════════════════════════════════════════════════════════
// FILE : EventHallResponse.java
// LAYER: DTO (Data Transfer Object)
//
// WHAT IS A RESPONSE DTO?
//   Encapsulates event hall data returned to the frontend or customer.
//   Provides consistent schema with helper getters for UI compatibility.
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem.dto;


import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor


public class EventHallResponse {

    private Long id;
    private String name;
    private BigDecimal pricePerEvent;
    private int seatingCapacity;
    private boolean available;
    private String description;
    private String imageUrl;
    private EventHallStatus status;

    // all arguments constructor
    public EventHallResponse(Long id, String name, BigDecimal pricePerEvent, int seatingCapacity,
                             boolean available, String description, String imageUrl, EventHallStatus status) {
        this.id = id;
        this.name = name;
        this.pricePerEvent = pricePerEvent;
        this.seatingCapacity = seatingCapacity;
        this.available = available;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    // getters
    public int getCapacity() {
        return seatingCapacity;
    }


    //----------- Builder design Pattern------------------------
    public static class Builder{

        private Long id;
        private String name;
        private BigDecimal pricePerEvent;
        private int seatingCapacity;
        private boolean available;
        private String description;
        private String imageUrl;
        private EventHallStatus status;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder pricePerEvent(BigDecimal pricePerEvent) {
            this.pricePerEvent = pricePerEvent;
            return this;
        }

        public Builder seatingCapacity(int seatingCapacity) {
            this.seatingCapacity = seatingCapacity;
            return this;
        }

        public Builder available(boolean available) {
            this.available = available;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder status(EventHallStatus status) {
            this.status = status;
            return this;
        }

        public EventHallResponse build(){
            return new EventHallResponse(id, name,pricePerEvent, seatingCapacity, available,
                    description, imageUrl, status);
        }

    }

    public static Builder builder(){
        return new Builder();
    }


    public static EventHallResponse fromEntity(EventHall hall) {
        if (hall == null) return null;
        return EventHallResponse.builder()
                .id( hall.getId() )
                .name( hall.getName() )
                .pricePerEvent( hall.getPricePerEvent() )
                .seatingCapacity( hall.getSeatingCapacity() )
                .available( hall.isAvailable() )
                .description( hall.getDescription() )
                .imageUrl( hall.getImageUrl() )
                .status( hall.getStatus() )
                .build();
    }
}

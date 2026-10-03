package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.EventHallRequest;
import com.hotel.reservationsystem.dto.EventHallResponse;

import java.util.List;

public interface EventHallService {

    EventHallResponse createEventHall(EventHallRequest request);

    List<EventHallResponse> getAllEventHalls();

    List<EventHallResponse> getAvailableEventHalls();

    EventHallResponse getEventHallById(Long id);

    EventHallResponse updateEventHall(
            Long id,
            EventHallRequest request);

    EventHallResponse updateAvailability(
            Long id,
            boolean available);

    void deleteEventHall(Long id);
}
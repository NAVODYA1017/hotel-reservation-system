package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByActiveTrue();
    List<Venue> findByCapacityGreaterThanEqual(int minCapacity);
    List<Venue> findByActiveTrueAndCapacityGreaterThanEqual(int minCapacity);
}

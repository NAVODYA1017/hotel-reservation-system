package com.sliit.se2030.hotel.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByActiveTrue();
    List<Venue> findByCapacityGreaterThanEqual(int minCapacity);
    List<Venue> findByActiveTrueAndCapacityGreaterThanEqual(int minCapacity);
}

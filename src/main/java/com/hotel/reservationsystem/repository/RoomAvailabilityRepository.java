package com.sliit.se2030.hotel.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {
    
    List<RoomAvailability> findByRoomId(Integer roomId);
    
    Optional<RoomAvailability> findByRoomIdAndDate(Integer roomId, LocalDate date);
    
    @Query("SELECT ra FROM RoomAvailability ra WHERE ra.roomId = :roomId AND ra.date BETWEEN :startDate AND :endDate AND ra.available = true")
    List<RoomAvailability> findAvailableRoomsInRange(@Param("roomId") Integer roomId, 
                                                       @Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ra FROM RoomAvailability ra WHERE ra.date BETWEEN :startDate AND :endDate AND ra.available = true")
    List<RoomAvailability> findAllAvailableInRange(@Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);
    
    void deleteByRoomId(Integer roomId);
}

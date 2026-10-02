package com.sliit.se2030.hotel.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    
    List<Room> findByRoomTypeId(Integer roomTypeId);
    List<Room> findByStatus(String status);
    List<Room> findByFloor(Integer floor);
    
    @Query("SELECT r FROM Room r WHERE r.roomTypeId = :roomTypeId AND r.status = :status")
    List<Room> findByRoomTypeIdAndStatus(@Param("roomTypeId") Integer roomTypeId, @Param("status") String status);
}

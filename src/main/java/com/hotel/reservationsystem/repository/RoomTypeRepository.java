package com.sliit.se2030.hotel.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    Optional<RoomType> findByTypeName(String typeName);
    boolean existsByTypeName(String typeName);
}

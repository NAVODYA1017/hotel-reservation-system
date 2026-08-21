package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.EventHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventHallRepository extends JpaRepository<EventHall, Long> {
}

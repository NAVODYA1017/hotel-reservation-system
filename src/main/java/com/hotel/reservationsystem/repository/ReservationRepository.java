package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Owned by UC-04 (Reservation Management). Kept to the exact shape of the
 * team's real repository (just JpaRepository defaults) so this file can be
 * safely overwritten by the real one without losing anything: UC-05 only
 * ever calls findById/save/findAll on it.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}

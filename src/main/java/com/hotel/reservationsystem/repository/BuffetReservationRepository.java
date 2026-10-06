package com.hotel.reservationsystem.repository;

import com.hotel.reservationsystem.entity.BuffetReservation;
import com.hotel.reservationsystem.entity.enums.BuffetReservationStatus;
import com.hotel.reservationsystem.entity.enums.MealSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BuffetReservationRepository extends JpaRepository<BuffetReservation, Long> {

    List<BuffetReservation> findByReservationDate(LocalDate reservationDate);

    List<BuffetReservation> findByReservationDateAndMealSession(LocalDate reservationDate, MealSession mealSession);

    List<BuffetReservation> findByReservationDateAndMealSessionAndStatusNot(
            LocalDate reservationDate, MealSession mealSession, BuffetReservationStatus status);

    Optional<BuffetReservation> findByConfirmationCodeIgnoreCase(String confirmationCode);

    List<BuffetReservation> findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(String guestEmail);

    List<BuffetReservation> findByReservationDateOrderByCreatedAtDesc(LocalDate reservationDate);
}

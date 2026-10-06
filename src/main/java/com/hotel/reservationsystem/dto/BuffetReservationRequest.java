package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.MealSession;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BuffetReservationRequest {

    @NotBlank(message = "Guest name is required.")
    private String guestName;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email.")
    private String guestEmail;

    private String guestPhone;

    @NotNull(message = "Reservation date is required.")
    private LocalDate reservationDate;

    @NotNull(message = "Meal session is required.")
    private MealSession mealSession;

    private String timeSlot;

    @Min(value = 1, message = "At least 1 adult guest is required.")
    private int adultCount = 1;

    @Min(value = 0, message = "Child count cannot be negative.")
    private int childCount = 0;

    private String specialDietary;

    private String tableNumber;

    private String bookedBy = "CLIENT_WEBSITE";
}

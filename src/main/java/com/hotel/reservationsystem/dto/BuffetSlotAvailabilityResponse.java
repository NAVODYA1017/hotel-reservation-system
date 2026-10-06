package com.hotel.reservationsystem.dto;

import com.hotel.reservationsystem.entity.enums.MealSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuffetSlotAvailabilityResponse {

    private LocalDate date;
    private MealSession mealSession;
    private String sessionTitle;
    private String timeRange;
    private int maxCapacity;
    private int bookedSeats;
    private int remainingSeats;
    private boolean isSoldOut;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
}

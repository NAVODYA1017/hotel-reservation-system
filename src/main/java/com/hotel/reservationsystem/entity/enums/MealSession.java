package com.hotel.reservationsystem.entity.enums;

import java.math.BigDecimal;

/**
 * Meal sessions for the Alaka Buffet Restaurant.
 * Includes fixed time windows, max guest capacities, and per-person rates.
 */
public enum MealSession {
    BREAKFAST("Sunrise Champagne Breakfast", "06:30 AM - 10:30 AM", 50, new BigDecimal("4500.00")),
    LUNCH("Ceylon Royal Spice Lunch", "12:30 PM - 03:30 PM", 60, new BigDecimal("6500.00")),
    DINNER("Grand Seafood & International Starlit Dinner", "07:00 PM - 10:30 PM", 70, new BigDecimal("8900.00"));

    private final String displayName;
    private final String timeRange;
    private final int defaultCapacity;
    private final BigDecimal defaultPrice;

    MealSession(String displayName, String timeRange, int defaultCapacity, BigDecimal defaultPrice) {
        this.displayName = displayName;
        this.timeRange = timeRange;
        this.defaultCapacity = defaultCapacity;
        this.defaultPrice = defaultPrice;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getTimeRange() {
        return timeRange;
    }

    public int getDefaultCapacity() {
        return defaultCapacity;
    }

    public BigDecimal getDefaultPrice() {
        return defaultPrice;
    }
}

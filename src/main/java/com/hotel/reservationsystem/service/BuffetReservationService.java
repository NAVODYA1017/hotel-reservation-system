package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.BuffetCheckInRequest;
import com.hotel.reservationsystem.dto.BuffetReservationRequest;
import com.hotel.reservationsystem.dto.BuffetSlotAvailabilityResponse;
import com.hotel.reservationsystem.entity.BuffetReservation;
import com.hotel.reservationsystem.entity.enums.BuffetReservationStatus;
import com.hotel.reservationsystem.entity.enums.MealSession;
import com.hotel.reservationsystem.exception.InvalidRequestException;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.BuffetReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hotel.reservationsystem.repository.PaymentRepository;
import com.hotel.reservationsystem.entity.Payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BuffetReservationService {

    @Autowired
    private BuffetReservationRepository buffetReservationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Checks capacity and availability for all meal sessions on a given date.
     */
    @Transactional(readOnly = true)
    public List<BuffetSlotAvailabilityResponse> checkAvailability(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        List<BuffetSlotAvailabilityResponse> availability = new ArrayList<>();

        for (MealSession session : MealSession.values()) {
            List<BuffetReservation> activeBookings = buffetReservationRepository
                    .findByReservationDateAndMealSessionAndStatusNot(date, session, BuffetReservationStatus.CANCELLED);

            int bookedSeats = activeBookings.stream()
                    .mapToInt(BuffetReservation::getNumberOfGuests)
                    .sum();

            int maxCapacity = session.getDefaultCapacity();
            int remaining = Math.max(0, maxCapacity - bookedSeats);
            boolean soldOut = remaining <= 0;

            BigDecimal adultPrice = session.getDefaultPrice();
            BigDecimal childPrice = adultPrice.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);

            availability.add(BuffetSlotAvailabilityResponse.builder()
                    .date(date)
                    .mealSession(session)
                    .sessionTitle(session.getDisplayName())
                    .timeRange(session.getTimeRange())
                    .maxCapacity(maxCapacity)
                    .bookedSeats(bookedSeats)
                    .remainingSeats(remaining)
                    .isSoldOut(soldOut)
                    .adultPrice(adultPrice)
                    .childPrice(childPrice)
                    .build());
        }

        return availability;
    }

    /**
     * Creates a new buffet reservation. Validates seat availability to prevent overbooking.
     */
    @Transactional
    public BuffetReservation createReservation(BuffetReservationRequest request) {
        if (request.getReservationDate() == null) {
            throw new InvalidRequestException("Reservation date is required.");
        }
        if (request.getReservationDate().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Cannot reserve a buffet session in the past.");
        }
        if (request.getMealSession() == null) {
            throw new InvalidRequestException("Please choose a valid meal session (BREAKFAST, LUNCH, or DINNER).");
        }

        int requestedGuests = request.getAdultCount() + request.getChildCount();
        if (requestedGuests <= 0) {
            throw new InvalidRequestException("At least one guest is required.");
        }

        MealSession session = request.getMealSession();
        List<BuffetReservation> activeBookings = buffetReservationRepository
                .findByReservationDateAndMealSessionAndStatusNot(request.getReservationDate(), session, BuffetReservationStatus.CANCELLED);

        int bookedSeats = activeBookings.stream()
                .mapToInt(BuffetReservation::getNumberOfGuests)
                .sum();

        int availableSeats = session.getDefaultCapacity() - bookedSeats;
        if (requestedGuests > availableSeats) {
            throw new InvalidRequestException("Only " + Math.max(0, availableSeats) + " seats available for " 
                    + session.getDisplayName() + " on " + request.getReservationDate() + ". Requested: " + requestedGuests);
        }

        BigDecimal adultPrice = session.getDefaultPrice();
        BigDecimal childPrice = adultPrice.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal total = adultPrice.multiply(BigDecimal.valueOf(request.getAdultCount()))
                .add(childPrice.multiply(BigDecimal.valueOf(request.getChildCount())))
                .setScale(2, RoundingMode.HALF_UP);

        BuffetReservation reservation = new BuffetReservation();
        reservation.setConfirmationCode(generateConfirmationCode(request.getReservationDate()));
        reservation.setGuestName(request.getGuestName().trim());
        reservation.setGuestEmail(request.getGuestEmail().trim().toLowerCase());
        reservation.setGuestPhone(request.getGuestPhone() != null ? request.getGuestPhone().trim() : null);
        reservation.setReservationDate(request.getReservationDate());
        reservation.setMealSession(session);
        reservation.setTimeSlot(request.getTimeSlot() != null ? request.getTimeSlot() : session.getTimeRange());
        reservation.setAdultCount(request.getAdultCount());
        reservation.setChildCount(request.getChildCount());
        reservation.setNumberOfGuests(requestedGuests);
        reservation.setPricePerPerson(adultPrice);
        reservation.setTotalAmount(total);
        reservation.setSpecialDietary(request.getSpecialDietary());
        reservation.setStatus(BuffetReservationStatus.CONFIRMED);
        reservation.setTableNumber(request.getTableNumber());
        reservation.setBookedBy(request.getBookedBy() != null ? request.getBookedBy() : "CLIENT_WEBSITE");
        reservation.setCreatedAt(LocalDateTime.now());

        return buffetReservationRepository.save(reservation);
    }

    /**
     * Looks up a buffet booking by confirmation code (for verification or guest view).
     */
    @Transactional(readOnly = true)
    public BuffetReservation getByConfirmationCode(String confirmationCode) {
        if (confirmationCode == null || confirmationCode.trim().isEmpty()) {
            throw new InvalidRequestException("Confirmation code is required.");
        }
        return buffetReservationRepository.findByConfirmationCodeIgnoreCase(confirmationCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No buffet reservation found for code: " + confirmationCode));
    }

    /**
     * Retrieves all buffet reservations with optional date, session, and search filters.
     */
    @Transactional(readOnly = true)
    public List<BuffetReservation> getAll(LocalDate date, MealSession session, String search) {
        List<BuffetReservation> list = (date != null)
                ? buffetReservationRepository.findByReservationDateOrderByCreatedAtDesc(date)
                : buffetReservationRepository.findAll();

        if (session != null) {
            list = list.stream()
                    .filter(r -> r.getMealSession() == session)
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String query = search.trim().toLowerCase();
            list = list.stream()
                    .filter(r -> (r.getConfirmationCode() != null && r.getConfirmationCode().toLowerCase().contains(query))
                            || (r.getGuestName() != null && r.getGuestName().toLowerCase().contains(query))
                            || (r.getGuestEmail() != null && r.getGuestEmail().toLowerCase().contains(query))
                            || (r.getTableNumber() != null && r.getTableNumber().toLowerCase().contains(query)))
                    .collect(Collectors.toList());
        }

        return list;
    }

    /**
     * Front desk / Receptionist check-in action.
     * Sets checkedInAt timestamp, assigns table number, and updates status to CHECKED_IN.
     */
    @Transactional
    public BuffetReservation checkInGuest(Long id, BuffetCheckInRequest request) {
        BuffetReservation reservation = buffetReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buffet reservation not found with id: " + id));

        if (reservation.getStatus() == BuffetReservationStatus.CANCELLED) {
            throw new InvalidRequestException("Cannot check in a cancelled buffet reservation.");
        }

        reservation.setStatus(BuffetReservationStatus.CHECKED_IN);
        reservation.setCheckedInAt(LocalDateTime.now());
        if (request != null && request.getTableNumber() != null && !request.getTableNumber().trim().isEmpty()) {
            reservation.setTableNumber(request.getTableNumber().trim());
        }

        return buffetReservationRepository.save(reservation);
    }

    /**
     * Front desk cancellation action.
     */
    @Transactional
    public BuffetReservation cancelReservation(Long id) {
        BuffetReservation reservation = buffetReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buffet reservation not found with id: " + id));

        reservation.setStatus(BuffetReservationStatus.CANCELLED);
        return buffetReservationRepository.save(reservation);
    }

    /**
     * Process online or front-desk payment for a buffet reservation.
     */
    @Transactional
    public BuffetReservation processPayment(com.hotel.reservationsystem.dto.BuffetPaymentRequest request) {
        BuffetReservation reservation = getByConfirmationCode(request.getConfirmationCode());

        reservation.setAmountPaid(request.getAmount());
        reservation.setPaymentStatus(com.hotel.reservationsystem.entity.enums.PaymentStatus.SUCCESS);
        reservation.setPaymentMethod(request.getPaymentMethod());
        reservation.setPaidAt(LocalDateTime.now());
        String txnRef = "TXN-BUF-" + System.currentTimeMillis();
        reservation.setTransactionReference(txnRef);

        BuffetReservation saved = buffetReservationRepository.save(reservation);

        Payment payment = new Payment();
        payment.setTransactionReference(txnRef);
        payment.setBuffetReservation(saved);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(com.hotel.reservationsystem.entity.enums.PaymentStatus.SUCCESS);
        payment.setPaymentReferenceInfo(request.getPaymentReferenceInfo());
        paymentRepository.save(payment);

        return saved;
    }

    /**
     * Return all buffet payments for the Payment Management Ledger.
     */
    @Transactional(readOnly = true)
    public List<com.hotel.reservationsystem.dto.BuffetPaymentResponse> getAllPayments() {
        return buffetReservationRepository.findAll().stream()
                .filter(r -> r.getPaymentStatus() == com.hotel.reservationsystem.entity.enums.PaymentStatus.SUCCESS
                        || (r.getAmountPaid() != null && r.getAmountPaid().compareTo(BigDecimal.ZERO) > 0))
                .map(com.hotel.reservationsystem.dto.BuffetPaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private String generateConfirmationCode(LocalDate date) {
        String datePart = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomDigits = 1000 + RANDOM.nextInt(9000);
        return "BUF-" + datePart + "-" + randomDigits;
    }
}

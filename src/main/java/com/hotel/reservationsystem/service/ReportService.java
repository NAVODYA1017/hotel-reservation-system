package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.DashboardResponse;
import com.hotel.reservationsystem.dto.PaymentResponse;
import com.hotel.reservationsystem.dto.ReportTypeResponse;
import com.hotel.reservationsystem.dto.ReservationReportResponse;
import com.hotel.reservationsystem.dto.ReservationResponse;
import com.hotel.reservationsystem.dto.RevenueReportResponse;
import com.hotel.reservationsystem.entity.EventHall;
import com.hotel.reservationsystem.entity.Payment;
import com.hotel.reservationsystem.entity.Reservation;
import com.hotel.reservationsystem.entity.Room;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.EventHallStatus;
import com.hotel.reservationsystem.entity.enums.PaymentMethod;
import com.hotel.reservationsystem.entity.enums.PaymentStatus;
import com.hotel.reservationsystem.entity.enums.ReservationStatus;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.entity.enums.RoomStatus;
import com.hotel.reservationsystem.exception.InvalidRequestException;
import com.hotel.reservationsystem.exception.ReportGenerationException;
import com.hotel.reservationsystem.repository.EventHallRepository;
import com.hotel.reservationsystem.repository.PaymentRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;
import com.hotel.reservationsystem.repository.RoomRepository;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * UC-06 "View Reports & Analytics": dashboard statistics plus reservation and revenue reports.
 *
 * Other modules own the repositories, so instead of adding query methods to them
 * this service loads the rows with findAll() and aggregates them with streams.
 */
@Service
public class ReportService {

    @Autowired
    private AdminAccessService adminAccessService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EventHallRepository eventHallRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    // ──────────────────────────────────────────────
    // STEPS 2-3: DASHBOARD STATISTICS
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long actingUserId) {
        adminAccessService.requireReportAccess(actingUserId);

        try {
            List<User> users = userRepository.findAll();
            List<Room> rooms = roomRepository.findAll();
            List<EventHall> halls = eventHallRepository.findAll();
            List<Reservation> reservations = reservationRepository.findAll();
            List<Payment> payments = paymentRepository.findAll();

            LocalDate today = LocalDate.now();
            DashboardResponse res = new DashboardResponse();
            res.setGeneratedAt(LocalDateTime.now());

            res.setTotalUsers(users.size());
            res.setUsersByRole(countByEnum(Role.values(), users, User::getRole));
            long customers = users.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
            res.setTotalCustomers(customers);
            res.setTotalStaff(users.size() - customers);

            res.setTotalRooms(rooms.size());
            res.setRoomsByStatus(countByEnum(RoomStatus.values(), rooms, Room::getStatus));
            res.setTotalEventHalls(halls.size());
            res.setHallsByStatus(countByEnum(EventHallStatus.values(), halls, EventHall::getStatus));

            res.setTotalReservations(reservations.size());
            res.setReservationsByStatus(countByEnum(ReservationStatus.values(), reservations, Reservation::getStatus));
            res.setTodayCheckIns(reservations.stream()
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                    .filter(r -> r.getCheckIn().isEqual(today))
                    .count());
            res.setTodayCheckOuts(reservations.stream()
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                    .filter(r -> r.getCheckOut().isEqual(today))
                    .count());
            res.setUpcomingReservationsNext7Days(reservations.stream()
                    .filter(r -> r.getStatus() == ReservationStatus.PENDING || r.getStatus() == ReservationStatus.CONFIRMED)
                    .filter(r -> r.getCheckIn().isAfter(today) && !r.getCheckIn().isAfter(today.plusDays(7)))
                    .count());

            List<Payment> successful = payments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());
            res.setTotalRevenue(sumAmounts(successful));
            res.setRevenueThisMonth(sumAmounts(successful.stream()
                    .filter(p -> p.getPaidAt() != null)
                    .filter(p -> p.getPaidAt().getYear() == today.getYear()
                            && p.getPaidAt().getMonth() == today.getMonth())
                    .collect(Collectors.toList())));
            res.setTotalRefunded(sumAmounts(payments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.REFUNDED)
                    .collect(Collectors.toList())));

            return res;
        } catch (RuntimeException ex) {
            throw new ReportGenerationException("Could not load dashboard statistics. Please try again.", ex);
        }
    }

    // ──────────────────────────────────────────────
    // STEP 5: LIST AVAILABLE REPORT TYPES
    // ──────────────────────────────────────────────
    public List<ReportTypeResponse> getReportTypes(Long actingUserId) {
        adminAccessService.requireReportAccess(actingUserId);

        return List.of(
                new ReportTypeResponse("RESERVATION", "Reservation Report",
                        "Room and event hall reservations by check-in date, with status breakdown and cancellation rate.",
                        "/api/admin/reports/reservations?from=yyyy-MM-dd&to=yyyy-MM-dd"),
                new ReportTypeResponse("REVENUE", "Revenue Report",
                        "Payments received in the period, refunds, net revenue, and breakdowns by payment method, booking type and day.",
                        "/api/admin/reports/revenue?from=yyyy-MM-dd&to=yyyy-MM-dd")
        );
    }

    // ──────────────────────────────────────────────
    // STEPS 6-8: RESERVATION REPORT
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public ReservationReportResponse generateReservationReport(Long actingUserId, LocalDate from, LocalDate to) {
        adminAccessService.requireReportAccess(actingUserId);
        LocalDate[] period = resolvePeriod(from, to);
        LocalDate start = period[0];
        LocalDate end = period[1];

        try {
            // Step 7: retrieve the relevant data
            List<Reservation> inPeriod = reservationRepository.findAll().stream()
                    .filter(r -> !r.getCheckIn().isBefore(start) && !r.getCheckIn().isAfter(end))
                    .sorted(Comparator.comparing(Reservation::getCheckIn).thenComparing(Reservation::getId))
                    .collect(Collectors.toList());

            // Step 8: generate the report
            ReservationReportResponse report = new ReservationReportResponse();
            report.setFromDate(start);
            report.setToDate(end);
            report.setGeneratedAt(LocalDateTime.now());
            report.setTotalReservations(inPeriod.size());
            report.setReservationsByStatus(countByEnum(ReservationStatus.values(), inPeriod, Reservation::getStatus));
            report.setRoomBookings(inPeriod.stream().filter(r -> r.getRoom() != null).count());
            report.setHallBookings(inPeriod.stream().filter(r -> r.getHall() != null).count());
            report.setBookingsByRoomType(inPeriod.stream()
                    .filter(r -> r.getRoom() != null)
                    .collect(Collectors.groupingBy(r -> r.getRoom().getRoomType(), TreeMap::new, Collectors.counting())));

            List<Reservation> notCancelled = inPeriod.stream()
                    .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
                    .collect(Collectors.toList());
            report.setTotalBookingValue(notCancelled.stream()
                    .map(Reservation::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));

            long cancelled = inPeriod.size() - notCancelled.size();
            report.setCancellationRatePercent(percentage(cancelled, inPeriod.size()));

            report.setReservations(inPeriod.stream().map(this::toReservationResponse).collect(Collectors.toList()));

            // Extension 6a: no data for the selected period
            report.setMessage(inPeriod.isEmpty()
                    ? "No reservations found with a check-in date between " + start + " and " + end + "."
                    : "Reservation report generated for " + start + " to " + end + ".");

            return report;
        } catch (RuntimeException ex) {
            // Extension 8a
            throw new ReportGenerationException("Reservation report generation failed. Please try again.", ex);
        }
    }

    // ──────────────────────────────────────────────
    // STEPS 6-8: REVENUE REPORT
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public RevenueReportResponse generateRevenueReport(Long actingUserId, LocalDate from, LocalDate to) {
        adminAccessService.requireReportAccess(actingUserId);
        LocalDate[] period = resolvePeriod(from, to);
        LocalDate start = period[0];
        LocalDate end = period[1];

        try {
            // Step 7: retrieve the relevant data
            List<Payment> inPeriod = paymentRepository.findAll().stream()
                    .filter(p -> p.getPaidAt() != null)
                    .filter(p -> {
                        LocalDate paidOn = p.getPaidAt().toLocalDate();
                        return !paidOn.isBefore(start) && !paidOn.isAfter(end);
                    })
                    .sorted(Comparator.comparing(Payment::getPaidAt))
                    .collect(Collectors.toList());

            List<Payment> successful = inPeriod.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());
            List<Payment> refunded = inPeriod.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.REFUNDED)
                    .collect(Collectors.toList());

            // Step 8: generate the report
            RevenueReportResponse report = new RevenueReportResponse();
            report.setFromDate(start);
            report.setToDate(end);
            report.setGeneratedAt(LocalDateTime.now());

            BigDecimal net = sumAmounts(successful);
            BigDecimal refundedAmount = sumAmounts(refunded);
            report.setSuccessfulPayments(successful.size());
            report.setRefundedPayments(refunded.size());
            report.setNetRevenue(net);
            report.setRefundedAmount(refundedAmount);
            report.setGrossRevenue(net.add(refundedAmount));
            report.setAveragePaymentValue(successful.isEmpty()
                    ? BigDecimal.ZERO
                    : net.divide(BigDecimal.valueOf(successful.size()), 2, RoundingMode.HALF_UP));

            Map<String, BigDecimal> byMethod = new LinkedHashMap<>();
            for (PaymentMethod method : PaymentMethod.values()) {
                byMethod.put(method.name(), BigDecimal.ZERO);
            }
            successful.forEach(p -> byMethod.merge(p.getMethod().name(), p.getAmount(), BigDecimal::add));
            report.setRevenueByPaymentMethod(byMethod);

            Map<String, BigDecimal> byType = new LinkedHashMap<>();
            byType.put("ROOM", BigDecimal.ZERO);
            byType.put("EVENT_HALL", BigDecimal.ZERO);
            successful.forEach(p -> byType.merge(
                    p.getReservation().getRoom() != null ? "ROOM" : "EVENT_HALL", p.getAmount(), BigDecimal::add));
            report.setRevenueByBookingType(byType);

            Map<LocalDate, BigDecimal> daily = new TreeMap<>();
            successful.forEach(p -> daily.merge(p.getPaidAt().toLocalDate(), p.getAmount(), BigDecimal::add));
            report.setDailyRevenue(daily);

            report.setPayments(inPeriod.stream().map(PaymentResponse::fromEntity).collect(Collectors.toList()));

            // Extension 6a: no data for the selected period
            report.setMessage(inPeriod.isEmpty()
                    ? "No payments found between " + start + " and " + end + "."
                    : "Revenue report generated for " + start + " to " + end + ".");

            return report;
        } catch (RuntimeException ex) {
            // Extension 8a
            throw new ReportGenerationException("Revenue report generation failed. Please try again.", ex);
        }
    }

    // ──────────────────────────────────────────────
    // HELPER: default to the current month, and validate the period
    // ──────────────────────────────────────────────
    private LocalDate[] resolvePeriod(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : today;

        if (start.isAfter(end)) {
            throw new InvalidRequestException("The 'from' date (" + start + ") must be on or before the 'to' date (" + end + ").");
        }
        return new LocalDate[]{start, end};
    }

    // ──────────────────────────────────────────────
    // HELPER: count items per enum value, keeping zero counts
    // ──────────────────────────────────────────────
    private <E extends Enum<E>, T> Map<String, Long> countByEnum(E[] values, List<T> items, Function<T, E> getter) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (E value : values) {
            counts.put(value.name(), 0L);
        }
        for (T item : items) {
            counts.merge(getter.apply(item).name(), 1L, Long::sum);
        }
        return counts;
    }

    private BigDecimal sumAmounts(List<Payment> payments) {
        return payments.stream().map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double percentage(long part, long total) {
        if (total == 0) {
            return 0.0;
        }
        return BigDecimal.valueOf(part * 100.0 / total).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    // ──────────────────────────────────────────────
    // HELPER: Convert Reservation entity → ReservationResponse DTO
    // (ReservationService's mapper is private, so UC-06 keeps its own copy)
    // ──────────────────────────────────────────────
    private ReservationResponse toReservationResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setStatus(reservation.getStatus().name());
        response.setCheckIn(reservation.getCheckIn());
        response.setCheckOut(reservation.getCheckOut());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setCreatedAt(reservation.getCreatedAt());
        response.setUserId(reservation.getUser().getId());
        response.setUserName(reservation.getUser().getName());

        if (reservation.getRoom() != null) {
            response.setRoomNumber(reservation.getRoom().getRoomNumber());
            response.setRoomType(reservation.getRoom().getRoomType());
        }
        if (reservation.getHall() != null) {
            response.setHallName(reservation.getHall().getName());
        }
        if (reservation.getEventPackage() != null) {
            response.setPackageName(reservation.getEventPackage().getName());
        }
        return response;
    }
}

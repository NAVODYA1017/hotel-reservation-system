package com.hotel.reservationsystem.controller;

import com.hotel.reservationsystem.dto.FrontDeskDtos.*;
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.service.AdminAccessService;
import com.hotel.reservationsystem.service.AdminAuthService;
import com.hotel.reservationsystem.service.FrontDeskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Front Desk (Receptionist) API.
 *
 * Every endpoint requires "Authorization: Bearer <token>" from the staff sign-in, and the
 * signed-in user must be a RECEPTIONIST (or a manager / system admin covering the desk).
 * Receptionists cannot reach /api/admin/** - those endpoints check for admin roles.
 */
@RestController
@RequestMapping("/api/frontdesk")
public class FrontDeskController {

    @Autowired private AdminAuthService authService;
    @Autowired private AdminAccessService accessService;
    @Autowired private FrontDeskService frontDesk;

    private User staff(String authorization) {
        return accessService.requireFrontDesk(authService.currentUserId(authorization));
    }

    // ── Dashboard ──
    @GetMapping("/summary")
    public Summary summary(@RequestHeader(value = "Authorization", required = false) String auth) {
        staff(auth);
        return frontDesk.summary();
    }

    // ── Arrivals / departures / in-house ──
    @GetMapping("/arrivals")
    public List<Booking> arrivals(@RequestHeader(value = "Authorization", required = false) String auth) {
        staff(auth);
        return frontDesk.arrivals();
    }

    @GetMapping("/departures")
    public List<Booking> departures(@RequestHeader(value = "Authorization", required = false) String auth) {
        staff(auth);
        return frontDesk.departures();
    }

    @GetMapping("/in-house")
    public List<Booking> inHouse(@RequestHeader(value = "Authorization", required = false) String auth) {
        staff(auth);
        return frontDesk.inHouse();
    }

    // ── Reservations ──
    @GetMapping("/reservations")
    public List<Booking> reservations(@RequestHeader(value = "Authorization", required = false) String auth,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(required = false) String state) {
        staff(auth);
        return frontDesk.searchReservations(q, state);
    }

    @GetMapping("/reservations/{id}")
    public Booking reservation(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        staff(auth);
        return frontDesk.getBooking(id);
    }

    @PostMapping("/walk-in")
    public Booking walkIn(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody WalkInRequest body) {
        staff(auth);
        return frontDesk.walkIn(body);
    }

    @PostMapping("/reservations/{id}/check-in")
    public Booking checkIn(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        staff(auth);
        return frontDesk.checkIn(id);
    }

    @PostMapping("/reservations/{id}/check-out")
    public Booking checkOut(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        staff(auth);
        return frontDesk.checkOut(id);
    }

    @PutMapping("/reservations/{id}/stay")
    public Booking changeStay(@RequestHeader(value = "Authorization", required = false) String auth,
                              @PathVariable Long id, @RequestBody StayChangeRequest body) {
        staff(auth);
        return frontDesk.changeCheckOut(id, body.checkOut());
    }

    @PostMapping("/reservations/{id}/cancel")
    public Booking cancel(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        staff(auth);
        return frontDesk.cancel(id);
    }

    // ── Room rack ──
    @GetMapping("/rooms")
    public List<RoomCard> rooms(@RequestHeader(value = "Authorization", required = false) String auth) {
        staff(auth);
        return frontDesk.rooms();
    }

    @PatchMapping("/rooms/{id}/status")
    public RoomCard roomStatus(@RequestHeader(value = "Authorization", required = false) String auth,
                               @PathVariable Long id, @RequestBody RoomStatusRequest body) {
        staff(auth);
        return frontDesk.setRoomStatus(id, body.status());
    }

    // ── Guest records ──
    @GetMapping("/guests")
    public List<GuestSummary> guests(@RequestHeader(value = "Authorization", required = false) String auth,
                                     @RequestParam(required = false) String q) {
        staff(auth);
        return frontDesk.guests(q);
    }

    @GetMapping("/guests/{id}")
    public GuestProfile guest(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        staff(auth);
        return frontDesk.guest(id);
    }

    @PutMapping("/guests/{id}")
    public GuestProfile updateGuest(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @PathVariable Long id, @RequestBody GuestUpdateRequest body) {
        staff(auth);
        return frontDesk.updateGuest(id, body);
    }

    // ── Payments ──
    @GetMapping("/payments")
    public List<PaymentRow> payments(@RequestHeader(value = "Authorization", required = false) String auth,
                                     @RequestParam(required = false) String filter) {
        staff(auth);
        return frontDesk.payments(filter);
    }

    @PostMapping("/payments")
    public PaymentRow takePayment(@RequestHeader(value = "Authorization", required = false) String auth,
                                  @RequestBody DeskPaymentRequest body) {
        return frontDesk.takePayment(body, staff(auth));
    }

    @PostMapping("/payments/{id}/verify")
    public PaymentRow verify(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable Long id) {
        return frontDesk.verifyPayment(id, staff(auth));
    }
}

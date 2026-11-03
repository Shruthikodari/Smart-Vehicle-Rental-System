package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.dto.BookingRequest;
import com.sms.vehiclerentalsystem.exception.ApiException;
import com.sms.vehiclerentalsystem.model.*;
import com.sms.vehiclerentalsystem.repository.BookingRepository;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Booking lifecycle:
 * PENDING --admin approves--> APPROVED --pickup day--> ONGOING --return day--> COMPLETED
 * PENDING --admin rejects--> REJECTED;  PENDING/APPROVED --cancelled--> CANCELLED
 */
@Service
public class BookingService {

    public static final double DRIVER_COST_PER_DAY = 500;
    public static final double TAX_RATE = 0.05;
    public static final int MAX_RENTAL_DAYS = 30;

    // Bookings in these states block the vehicle/driver for their dates
    public static final List<Booking.Status> ACTIVE_STATUSES =
            Arrays.asList(Booking.Status.PENDING, Booking.Status.APPROVED, Booking.Status.ONGOING);

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, VehicleRepository vehicleRepository,
                          DriverRepository driverRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.notificationService = notificationService;
    }

    public boolean isVehicleAvailable(Long vehicleId, LocalDate pickupDate, LocalDate returnDate) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElseThrow(() -> ApiException.notFound("Vehicle"));
        return vehicle.getStatus() != Vehicle.Status.MAINTENANCE
                && !bookingRepository.vehicleHasOverlap(vehicleId, pickupDate, returnDate, ACTIVE_STATUSES);
    }

    public boolean isDriverAvailable(LocalDate pickupDate, LocalDate returnDate) {
        return driverRepository.findByStatusOrderByRatingDesc(Driver.Status.ACTIVE).stream()
                .anyMatch(d -> !bookingRepository.driverHasOverlap(d.getId(), pickupDate, returnDate, ACTIVE_STATUSES));
    }

    @Transactional
    public Booking createBooking(BookingRequest request, User user) {
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please log in to book a vehicle");
        }
        LocalDate pickup = request.getPickupDate();
        LocalDate dropoff = request.getReturnDate();
        if (pickup.isBefore(LocalDate.now())) {
            throw ApiException.badRequest("Pick-up date cannot be in the past");
        }
        if (!dropoff.isAfter(pickup)) {
            throw ApiException.badRequest("Return date must be after the pick-up date");
        }
        int days = (int) ChronoUnit.DAYS.between(pickup, dropoff);
        if (days > MAX_RENTAL_DAYS) {
            throw ApiException.badRequest("Bookings can be at most " + MAX_RENTAL_DAYS + " days");
        }

        // Lock the vehicle row so concurrent bookings for it are checked one at a time
        Vehicle vehicle = vehicleRepository.findByIdForUpdate(request.getVehicleId())
                .orElseThrow(() -> ApiException.notFound("Vehicle"));
        if (vehicle.getStatus() == Vehicle.Status.MAINTENANCE) {
            throw new ApiException(HttpStatus.CONFLICT, vehicle.getName() + " is under maintenance");
        }
        if (bookingRepository.vehicleHasOverlap(vehicle.getId(), pickup, dropoff, ACTIVE_STATUSES)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    vehicle.getName() + " is already booked for some of these dates. Please choose other dates.");
        }

        Booking booking = new Booking();
        booking.setBookingCode(newCode("BK-"));
        booking.setVehicle(vehicle);
        booking.setUser(user);
        booking.setCustomerName(user.getName());
        booking.setCustomerEmail(user.getEmail());
        booking.setCustomerPhone(user.getPhone());
        booking.setPickupDate(pickup);
        booking.setReturnDate(dropoff);
        booking.setDays(days);
        booking.setDriverType(request.getDriverType());

        if (request.getDriverType() == Booking.DriverType.WITH_DRIVER) {
            booking.setDriver(findFreeDriver(pickup, dropoff));
        }

        // Prices are always calculated on the server, never trusted from the client
        double base = vehicle.getPricePerDay() * days;
        double taxes = Math.round(base * TAX_RATE);
        double driverCost = request.getDriverType() == Booking.DriverType.WITH_DRIVER ? DRIVER_COST_PER_DAY * days : 0;
        booking.setBasePrice(base);
        booking.setTaxes(taxes);
        booking.setDriverCost(driverCost);
        booking.setTotal(base + taxes + driverCost);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotal());
        payment.setMethod(request.getPaymentMethod());
        if (request.getPaymentMethod() == Payment.Method.CASH) {
            payment.setStatus(Payment.Status.PENDING);
        } else {
            payment.setStatus(Payment.Status.PAID);
            payment.setTransactionId(newCode("TXN"));
            payment.setPaidAt(LocalDateTime.now());
        }
        booking.setPayment(payment);

        // Every booking waits for admin review
        booking.setStatus(Booking.Status.PENDING);
        Booking saved = bookingRepository.save(booking);

        notificationService.notify(user, Notification.Type.INFO, "Booking Request Received",
                String.format("Your request for %s (%s to %s) is waiting for admin approval.",
                        vehicle.getName(), pickup, dropoff), saved.getBookingCode());
        return saved;
    }

    private Driver findFreeDriver(LocalDate pickup, LocalDate dropoff) {
        return driverRepository.findByStatusOrderByRatingDesc(Driver.Status.ACTIVE).stream()
                .filter(d -> !bookingRepository.driverHasOverlap(d.getId(), pickup, dropoff, ACTIVE_STATUSES))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT,
                        "No drivers are free for these dates. Please choose self-drive or other dates."));
    }

    public List<Booking> findForUser(User user) {
        return bookingRepository.findByUserIdOrderByPickupDateDesc(user.getId());
    }

    public Booking findByCode(String code) {
        return bookingRepository.findByBookingCode(code).orElseThrow(() -> ApiException.notFound("Booking"));
    }

    public Booking findOwnByCode(String code, User user) {
        Booking booking = findByCode(code);
        if (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This booking belongs to another account");
        }
        return booking;
    }

    public List<Booking> findAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Booking cancelByCustomer(String code, User user) {
        Booking booking = findOwnByCode(code, user);
        if (booking.getStatus() != Booking.Status.PENDING && booking.getStatus() != Booking.Status.APPROVED) {
            throw ApiException.badRequest("Only pending or approved bookings can be cancelled");
        }
        if (!booking.getPickupDate().isAfter(LocalDate.now())) {
            throw ApiException.badRequest("Bookings can only be cancelled before the pick-up date");
        }
        close(booking, Booking.Status.CANCELLED, "Cancelled by customer");
        notify(booking, Notification.Type.WARNING, "Booking Cancelled",
                "You cancelled booking " + booking.getBookingCode() + refundText(booking));
        return booking;
    }

    @Transactional
    public Booking updateStatusByAdmin(Long id, Booking.Status newStatus, String note) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> ApiException.notFound("Booking"));
        Booking.Status current = booking.getStatus();
        switch (newStatus) {
            case APPROVED:
                require(current == Booking.Status.PENDING, "Only pending bookings can be approved");
                booking.setStatus(Booking.Status.APPROVED);
                booking.setAdminNote(note);
                notify(booking, Notification.Type.SUCCESS, "Booking Approved",
                        String.format("Your %s booking is approved. Pick up on %s at %s.%s",
                                booking.getVehicle().getName(), booking.getPickupDate(), booking.getVehicle().getLocation(),
                                booking.getDriver() != null ? " Your driver: " + booking.getDriver().getName()
                                        + " (" + booking.getDriver().getPhone() + ")." : ""));
                break;
            case REJECTED:
                require(current == Booking.Status.PENDING, "Only pending bookings can be rejected");
                close(booking, Booking.Status.REJECTED, note);
                notify(booking, Notification.Type.WARNING, "Booking Rejected",
                        "Booking " + booking.getBookingCode() + " was rejected"
                                + (note != null && !note.isEmpty() ? ": " + note : "") + refundText(booking));
                break;
            case ONGOING:
                require(current == Booking.Status.APPROVED, "Only approved bookings can start");
                require(!booking.getPickupDate().isAfter(LocalDate.now()), "The rental cannot start before the pick-up date");
                start(booking);
                break;
            case COMPLETED:
                require(current == Booking.Status.ONGOING, "Only ongoing rentals can be completed");
                complete(booking);
                break;
            case CANCELLED:
                require(current == Booking.Status.PENDING || current == Booking.Status.APPROVED,
                        "Only pending or approved bookings can be cancelled");
                close(booking, Booking.Status.CANCELLED, note);
                notify(booking, Notification.Type.WARNING, "Booking Cancelled",
                        "Booking " + booking.getBookingCode() + " was cancelled by SmartRide"
                                + (note != null && !note.isEmpty() ? ": " + note : "") + refundText(booking));
                break;
            default:
                throw ApiException.badRequest("Unsupported status " + newStatus);
        }
        return bookingRepository.save(booking);
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw ApiException.badRequest(message);
        }
    }

    private void close(Booking booking, Booking.Status status, String note) {
        booking.setStatus(status);
        booking.setAdminNote(note);
        Payment payment = booking.getPayment();
        if (payment != null && payment.getStatus() == Payment.Status.PAID) {
            payment.setStatus(Payment.Status.REFUNDED);
        }
    }

    private static String refundText(Booking booking) {
        Payment p = booking.getPayment();
        return p != null && p.getStatus() == Payment.Status.REFUNDED
                ? ". ₹" + Math.round(p.getAmount()) + " will be refunded." : ".";
    }

    private void start(Booking booking) {
        booking.setStatus(Booking.Status.ONGOING);
        notify(booking, Notification.Type.INFO, "Rental Started",
                "Your " + booking.getVehicle().getName() + " rental has started. Return it by " + booking.getReturnDate() + ". Drive safe!");
    }

    private void complete(Booking booking) {
        booking.setStatus(Booking.Status.COMPLETED);
        if (booking.getDriver() != null) {
            booking.getDriver().setTrips(booking.getDriver().getTrips() + 1);
        }
        Payment payment = booking.getPayment();
        if (payment != null && payment.getStatus() == Payment.Status.PENDING) {
            // Cash collected at pickup
            payment.setStatus(Payment.Status.PAID);
            payment.setTransactionId(newCode("CASH"));
            payment.setPaidAt(LocalDateTime.now());
        }
        notify(booking, Notification.Type.SUCCESS, "Rental Completed",
                "Thanks for riding with SmartRide! Please rate your " + booking.getVehicle().getName() + " experience.");
    }

    private void notify(Booking booking, Notification.Type type, String title, String message) {
        notificationService.notify(booking.getUser(), type, title, message, booking.getBookingCode());
    }

    /**
     * Runs every hour (and shortly after startup) to move bookings along with the calendar:
     * approved rentals start on the pick-up day, ongoing rentals complete after the return day,
     * pending requests that were never reviewed expire, and customers get a pickup reminder the day before.
     */
    @Scheduled(initialDelay = 5_000, fixedRate = 3_600_000)
    @Transactional
    public void advanceBookings() {
        LocalDate today = LocalDate.now();

        List<Booking> starting = bookingRepository.findByStatusAndPickupDateLessThanEqual(Booking.Status.APPROVED, today);
        starting.forEach(this::start);

        List<Booking> finished = bookingRepository.findByStatusAndReturnDateBefore(Booking.Status.ONGOING, today);
        finished.forEach(this::complete);

        List<Booking> expired = bookingRepository.findByStatusAndPickupDateBefore(Booking.Status.PENDING, today);
        for (Booking b : expired) {
            close(b, Booking.Status.REJECTED, "Not reviewed before the pick-up date");
            notify(b, Notification.Type.WARNING, "Booking Expired",
                    "Booking " + b.getBookingCode() + " was not approved in time" + refundText(b));
        }

        List<Booking> tomorrow = bookingRepository.findByStatusAndPickupDateAndReminderSentFalse(
                Booking.Status.APPROVED, today.plusDays(1));
        for (Booking b : tomorrow) {
            b.setReminderSent(true);
            notify(b, Notification.Type.REMINDER, "Pickup Tomorrow",
                    "Reminder: pick up your " + b.getVehicle().getName() + " tomorrow at " + b.getVehicle().getLocation() + ".");
        }

        bookingRepository.saveAll(starting);
        bookingRepository.saveAll(finished);
        bookingRepository.saveAll(expired);
        bookingRepository.saveAll(tomorrow);
    }

    private static String newCode(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}

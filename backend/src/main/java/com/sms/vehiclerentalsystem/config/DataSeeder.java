package com.sms.vehiclerentalsystem.config;

import com.sms.vehiclerentalsystem.dto.NewDriverRequest;
import com.sms.vehiclerentalsystem.model.*;
import com.sms.vehiclerentalsystem.repository.*;
import com.sms.vehiclerentalsystem.service.AuthService;
import com.sms.vehiclerentalsystem.service.BookingService;
import com.sms.vehiclerentalsystem.service.ReviewService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Fills an empty database with an admin account, customer accounts, vehicles, drivers, sample bookings,
 * reviews and notifications so the app and its analytics have data to show on first run.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@smartride.com";
    public static final String ADMIN_PASSWORD = "admin1234";
    public static final String DEMO_CUSTOMER_EMAIL = "demo@smartride.com";
    public static final String DEMO_CUSTOMER_PASSWORD = "demo1234";
    public static final String SAMPLE_CUSTOMER_PASSWORD = "password123";
    public static final String DRIVER_PASSWORD = "driver123";

    private static final String[] COMMENTS = {
            "Clean car and smooth pickup. Will book again!",
            "Great condition, very fuel efficient.",
            "Driver was polite and on time.",
            "Good value for money.",
            "Pickup took a little long but the ride was great.",
            "Exactly as shown in the photos.",
            "Comfortable for a family trip.",
            "Loved the drive, highly recommended!",
    };

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final AuthService authService;
    private final ReviewService reviewService;

    public DataSeeder(UserRepository userRepository, VehicleRepository vehicleRepository,
                      DriverRepository driverRepository, BookingRepository bookingRepository,
                      ReviewRepository reviewRepository, NotificationRepository notificationRepository,
                      AuthService authService, ReviewService reviewService) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.authService = authService;
        this.reviewService = reviewService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).isPresent()) {
            User admin = new User();
            admin.setName("SmartRide Admin");
            admin.setEmail(ADMIN_EMAIL);
            admin.setPhone("9000000000");
            admin.setPasswordHash(authService.hash(ADMIN_PASSWORD));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }

        if (vehicleRepository.count() == 0) {
            vehicleRepository.saveAll(Arrays.asList(
                    new Vehicle("Hyundai Creta", "HYUNDAI", "SUV",
                            "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
                            1900, 4.5, 17, "Petrol", "Automatic", 5, "HITEC City, Hyderabad"),
                    new Vehicle("Maruti Swift", "MARUTI SUZUKI", "CAR",
                            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
                            1200, 4.4, 23, "Petrol", "Manual", 5, "Kukatpally, Hyderabad"),
                    new Vehicle("Honda City", "HONDA", "CAR",
                            "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
                            1500, 4.6, 18, "Petrol", "Automatic", 5, "Madhapur, Hyderabad"),
                    new Vehicle("Volvo S90", "VOLVO", "LUXURY",
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                            5000, 4.8, 12, "Diesel", "Automatic", 5, "RGIA Airport, Hyderabad"),
                    new Vehicle("BMW X5", "BMW", "LUXURY",
                            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
                            6500, 4.8, 11, "Diesel", "Automatic", 5, "Banjara Hills, Hyderabad"),
                    new Vehicle("Mahindra Scorpio", "MAHINDRA", "SUV",
                            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
                            2500, 4.3, 15, "Diesel", "Manual", 7, "Secunderabad, Hyderabad"),
                    new Vehicle("Tesla Model 3", "TESLA", "EV",
                            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
                            4500, 4.9, 450, "Electric", "Automatic", 5, "Gachibowli, Hyderabad"),
                    new Vehicle("Royal Enfield Classic 350", "ROYAL ENFIELD", "BIKE",
                            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
                            800, 4.6, 35, "Petrol", "Manual", 2, "Ameerpet, Hyderabad"),
                    new Vehicle("KTM Duke 390", "KTM", "BIKE",
                            "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800",
                            1200, 4.7, 25, "Petrol", "Manual", 2, "Kondapur, Hyderabad"),
                    new Vehicle("Maruti Swift", "MARUTI SUZUKI", "CAR",
                            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
                            1300, 4.4, 23, "Petrol", "Automatic", 5, "Koramangala, Bengaluru"),
                    new Vehicle("Royal Enfield Classic 350", "ROYAL ENFIELD", "BIKE",
                            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
                            850, 4.6, 35, "Petrol", "Manual", 2, "Indiranagar, Bengaluru"),
                    new Vehicle("Hyundai Creta", "HYUNDAI", "SUV",
                            "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
                            2000, 4.5, 17, "Diesel", "Manual", 5, "Andheri, Mumbai")
            ));
        }

        if (driverRepository.count() == 0) {
            List<Driver> drivers = driverRepository.saveAll(Arrays.asList(
                    new Driver("Raj Kumar", "9876543210", "raj@smartride.com", "TS0920190001234", 4.8, 0),
                    new Driver("Priya Singh", "9876543211", "priya@smartride.com", "TS0820180004321", 4.6, 0),
                    new Driver("Arjun Patel", "9876543212", "arjun@smartride.com", "TS0720200005678", 4.2, 0),
                    new Driver("Neha Verma", "9876543213", "neha@smartride.com", "TS1020170008765", 4.9, 0),
                    new Driver("Imran Shaikh", "9876543214", "imran@smartride.com", "TS1320210002468", 4.5, 0)
            ));
            // Each driver gets a login for the driver portal
            for (Driver d : drivers) {
                User account = authService.createAccount(d.getName(), d.getEmail(), d.getPhone(),
                        DRIVER_PASSWORD, User.Role.DRIVER);
                d.setAccount(account);
            }
            driverRepository.saveAll(drivers);
        }

        if (bookingRepository.count() == 0) {
            seedBookings();
        }
    }

    private User customer(String name, String email, String phone, String password) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPhone(phone);
            u.setPasswordHash(authService.hash(password));
            u.setRole(User.Role.USER);
            return userRepository.save(u);
        });
    }

    private void seedBookings() {
        User demo = customer("Demo Customer", DEMO_CUSTOMER_EMAIL, "9123456789", DEMO_CUSTOMER_PASSWORD);
        List<User> customers = Arrays.asList(
                demo,
                customer("Rahul Sharma", "rahul@example.com", "9811111111", SAMPLE_CUSTOMER_PASSWORD),
                customer("Ananya Iyer", "ananya@example.com", "9822222222", SAMPLE_CUSTOMER_PASSWORD),
                customer("Vikram Reddy", "vikram@example.com", "9833333333", SAMPLE_CUSTOMER_PASSWORD),
                customer("Sneha Kulkarni", "sneha@example.com", "9844444444", SAMPLE_CUSTOMER_PASSWORD),
                customer("Karan Mehta", "karan@example.com", "9855555555", SAMPLE_CUSTOMER_PASSWORD)
        );
        Random random = new Random(42);
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Driver> drivers = driverRepository.findAll();
        LocalDate today = LocalDate.now();

        // Walk each vehicle's calendar forward so seeded bookings never overlap
        Map<Long, LocalDate> nextFree = new HashMap<>();
        int driverIndex = 0;
        List<Booking> created = new ArrayList<>();

        for (Vehicle vehicle : vehicles) {
            LocalDate cursor = today.minusMonths(6).withDayOfMonth(1).plusDays(random.nextInt(10));
            while (true) {
                LocalDate pickup = cursor.plusDays(8 + random.nextInt(18));
                int days = 1 + random.nextInt(4);
                LocalDate dropoff = pickup.plusDays(days);
                if (pickup.isAfter(today.plusDays(20))) {
                    break;
                }
                cursor = dropoff;
                nextFree.put(vehicle.getId(), dropoff);
                if (random.nextInt(10) < 2) {
                    continue;
                }

                User c = customers.get(random.nextInt(customers.size()));
                boolean withDriver = !"BIKE".equals(vehicle.getType()) && random.nextInt(3) == 0;
                Payment.Method method = Payment.Method.values()[random.nextInt(3)];

                Booking.Status status;
                if (dropoff.isBefore(today)) {
                    int r = random.nextInt(20);
                    status = r == 0 ? Booking.Status.REJECTED : r == 1 ? Booking.Status.CANCELLED : Booking.Status.COMPLETED;
                } else if (!pickup.isAfter(today)) {
                    status = Booking.Status.ONGOING;
                } else {
                    status = random.nextInt(5) < 2 ? Booking.Status.PENDING : Booking.Status.APPROVED;
                }

                Driver driver = withDriver ? drivers.get(driverIndex++ % drivers.size()) : null;
                created.add(save(vehicle, driver, c, pickup, dropoff, method, status));
            }
        }

        // Make sure the demo customer can see every stage of the flow
        Vehicle creta = vehicles.get(0);
        LocalDate start = later(nextFree.get(creta.getId()), today).plusDays(4);
        created.add(save(creta, null, demo, start, start.plusDays(2), Payment.Method.UPI, Booking.Status.APPROVED));
        Vehicle city = vehicles.get(2);
        LocalDate start2 = later(nextFree.get(city.getId()), today).plusDays(6);
        created.add(save(city, drivers.get(3), demo, start2, start2.plusDays(3), Payment.Method.CARD, Booking.Status.PENDING));

        seedReviews(created, demo, random);
        seedNotifications(demo);
        seedStaffNotifications(created);

        // A driver who signed up and is waiting for admin approval (also notifies the admins)
        NewDriverRequest pending = new NewDriverRequest();
        pending.setName("Suresh Yadav");
        pending.setEmail("suresh@smartride.com");
        pending.setPhone("9876543215");
        pending.setLicenseNumber("TS0820220007531");
        pending.setPassword(DRIVER_PASSWORD);
        authService.registerDriver(pending);
    }

    // What admins and drivers would have been told about the bookings that are still open
    private void seedStaffNotifications(List<Booking> bookings) {
        List<User> admins = userRepository.findByRoleOrderByCreatedAtDesc(User.Role.ADMIN);
        for (Booking b : bookings) {
            if (b.getStatus() == Booking.Status.PENDING) {
                for (User admin : admins) {
                    note(admin, b, Notification.Type.INFO, "New booking request",
                            String.format("%s requested %s from %s to %s (%s, ₹%.0f).", b.getCustomerName(),
                                    b.getVehicle().getName(), b.getPickupDate(), b.getReturnDate(),
                                    b.getPayment().getMethod(), b.getTotal()), false, b.getCreatedAt());
                }
            }
            boolean openTrip = b.getStatus() == Booking.Status.APPROVED || b.getStatus() == Booking.Status.ONGOING;
            if (openTrip && b.getDriver() != null && b.getDriver().getAccount() != null) {
                note(b.getDriver().getAccount(), b, Notification.Type.INFO, "New trip assigned",
                        String.format("%s, %s to %s. Meet %s (%s) at %s.", b.getVehicle().getName(),
                                b.getPickupDate(), b.getReturnDate(), b.getCustomerName(), b.getCustomerPhone(),
                                b.getVehicle().getLocation()),
                        b.getStatus() == Booking.Status.ONGOING, b.getCreatedAt().plusHours(5));
            }
        }
    }

    private static LocalDate later(LocalDate a, LocalDate b) {
        return a == null || a.isBefore(b) ? b : a;
    }

    private Booking save(Vehicle vehicle, Driver driver, User customer, LocalDate pickup, LocalDate dropoff,
                         Payment.Method method, Booking.Status status) {
        int days = (int) (dropoff.toEpochDay() - pickup.toEpochDay());
        double base = vehicle.getPricePerDay() * days;
        double taxes = Math.round(base * BookingService.TAX_RATE);
        double driverCost = driver != null ? BookingService.DRIVER_COST_PER_DAY * days : 0;

        Booking b = new Booking();
        b.setBookingCode("BK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
        b.setVehicle(vehicle);
        b.setDriver(driver);
        b.setUser(customer);
        b.setCustomerName(customer.getName());
        b.setCustomerEmail(customer.getEmail());
        b.setCustomerPhone(customer.getPhone());
        b.setPickupDate(pickup);
        b.setReturnDate(dropoff);
        b.setDays(days);
        b.setDriverType(driver != null ? Booking.DriverType.WITH_DRIVER : Booking.DriverType.SELF_DRIVE);
        b.setBasePrice(base);
        b.setTaxes(taxes);
        b.setDriverCost(driverCost);
        b.setTotal(base + taxes + driverCost);
        b.setStatus(status);
        if (status == Booking.Status.REJECTED) {
            b.setAdminNote("Vehicle needed for servicing on these dates");
        }
        // Booked a few days before pickup, but never later than "now" for upcoming rentals
        LocalDateTime created = pickup.minusDays(3).atTime(10, 0);
        LocalDateTime latest = LocalDateTime.now().minusHours(6 + pickup.getDayOfMonth());
        b.setCreatedAt(created.isAfter(latest) ? latest : created);

        Payment p = new Payment();
        p.setBooking(b);
        p.setAmount(b.getTotal());
        p.setMethod(method);
        boolean closed = status == Booking.Status.CANCELLED || status == Booking.Status.REJECTED;
        if (method == Payment.Method.CASH) {
            p.setStatus(status == Booking.Status.COMPLETED ? Payment.Status.PAID : Payment.Status.PENDING);
        } else {
            p.setStatus(closed ? Payment.Status.REFUNDED : Payment.Status.PAID);
        }
        if (p.getStatus() != Payment.Status.PENDING) {
            p.setTransactionId((method == Payment.Method.CASH ? "CASH" : "TXN")
                    + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
            p.setPaidAt(b.getCreatedAt());
        }
        b.setPayment(p);

        if (driver != null && status == Booking.Status.COMPLETED) {
            driver.setTrips(driver.getTrips() + 1);
        }
        return bookingRepository.save(b);
    }

    private void seedReviews(List<Booking> bookings, User demo, Random random) {
        // Leave the demo customer's latest completed rental unrated so the review step can be tried
        Booking demoLatest = bookings.stream()
                .filter(b -> b.getUser() == demo && b.getStatus() == Booking.Status.COMPLETED)
                .max(Comparator.comparing(Booking::getReturnDate))
                .orElse(null);

        for (Booking b : bookings) {
            if (b.getStatus() != Booking.Status.COMPLETED || b == demoLatest || random.nextInt(4) == 0) {
                continue;
            }
            Review r = new Review();
            r.setBooking(b);
            r.setUser(b.getUser());
            r.setVehicle(b.getVehicle());
            r.setDriver(b.getDriver());
            // Mostly 4-5 stars with the occasional 3
            r.setVehicleRating(random.nextInt(6) == 0 ? 3 : 4 + random.nextInt(2));
            r.setDriverRating(b.getDriver() != null ? (random.nextInt(6) == 0 ? 3 : 4 + random.nextInt(2)) : null);
            r.setComment(COMMENTS[random.nextInt(COMMENTS.length)]);
            r.setCreatedAt(b.getReturnDate().atTime(18, 0));
            b.setReview(reviewRepository.save(r));
        }
        reviewRepository.flush();
        vehicleRepository.findAll().forEach(reviewService::refreshVehicleRating);
        driverRepository.findAll().forEach(reviewService::refreshDriverRating);
    }

    // Notifications the demo customer would have received for their bookings
    private void seedNotifications(User demo) {
        LocalDate today = LocalDate.now();
        List<Booking> mine = bookingRepository.findByUserIdOrderByPickupDateDesc(demo.getId());
        for (Booking b : mine) {
            String v = b.getVehicle().getName();
            boolean recent = !b.getReturnDate().isBefore(today.minusDays(20));
            switch (b.getStatus()) {
                case PENDING:
                    note(demo, b, Notification.Type.INFO, "Booking Request Received",
                            "Your request for " + v + " (" + b.getPickupDate() + " to " + b.getReturnDate()
                                    + ") is waiting for admin approval.", false, b.getCreatedAt());
                    break;
                case APPROVED:
                    note(demo, b, Notification.Type.SUCCESS, "Booking Approved",
                            "Your " + v + " booking is approved. Pick up on " + b.getPickupDate() + " at "
                                    + b.getVehicle().getLocation() + ".", false, b.getCreatedAt().plusHours(5));
                    break;
                case ONGOING:
                    note(demo, b, Notification.Type.INFO, "Rental Started",
                            "Your " + v + " rental has started. Return it by " + b.getReturnDate() + ". Drive safe!",
                            false, b.getPickupDate().atTime(9, 0));
                    break;
                case COMPLETED:
                    if (recent) {
                        note(demo, b, Notification.Type.SUCCESS, "Rental Completed",
                                "Thanks for riding with SmartRide! Please rate your " + v + " experience.",
                                b.getReview() != null, b.getReturnDate().plusDays(1).atTime(9, 0));
                    }
                    break;
                case REJECTED:
                case CANCELLED:
                    if (recent) {
                        String word = b.getStatus() == Booking.Status.REJECTED ? "Rejected" : "Cancelled";
                        note(demo, b, Notification.Type.WARNING, "Booking " + word,
                                "Booking " + b.getBookingCode() + " for " + v + " was " + word.toLowerCase() + ".",
                                true, b.getCreatedAt().plusHours(5));
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private void note(User user, Booking b, Notification.Type type, String title, String message,
                      boolean read, LocalDateTime at) {
        Notification n = new Notification(user, type, title, message, b.getBookingCode());
        n.setRead(read);
        n.setCreatedAt(at);
        notificationRepository.save(n);
    }
}

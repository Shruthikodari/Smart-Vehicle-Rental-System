package com.sms.vehiclerentalsystem.service;

import com.sms.vehiclerentalsystem.model.Booking;
import com.sms.vehiclerentalsystem.model.Driver;
import com.sms.vehiclerentalsystem.model.Payment;
import com.sms.vehiclerentalsystem.model.Vehicle;
import com.sms.vehiclerentalsystem.repository.BookingRepository;
import com.sms.vehiclerentalsystem.repository.DriverRepository;
import com.sms.vehiclerentalsystem.repository.ReviewRepository;
import com.sms.vehiclerentalsystem.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ReviewRepository reviewRepository;

    public AnalyticsService(BookingRepository bookingRepository, VehicleRepository vehicleRepository,
                            DriverRepository driverRepository, ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    // Money actually received (refunded payments are excluded)
    private static double paidAmount(Booking b) {
        Payment p = b.getPayment();
        return p != null && p.getStatus() == Payment.Status.PAID ? p.getAmount() : 0;
    }

    private static boolean counts(Booking b) {
        return b.getStatus() != Booking.Status.CANCELLED && b.getStatus() != Booking.Status.REJECTED;
    }

    public Map<String, Object> dashboard() {
        List<Booking> all = bookingRepository.findAll();

        long onRentToday = all.stream()
                .filter(b -> b.getStatus() == Booking.Status.ONGOING)
                .map(b -> b.getVehicle().getId())
                .distinct().count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", all.size());
        stats.put("totalRevenue", all.stream().mapToDouble(AnalyticsService::paidAmount).sum());
        stats.put("pendingBookings", bookingRepository.countByStatus(Booking.Status.PENDING));
        stats.put("activeDrivers", driverRepository.countByStatus(Driver.Status.ACTIVE));
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("availableVehicles", Math.max(0, vehicleRepository.countByStatus(Vehicle.Status.AVAILABLE) - onRentToday));
        stats.put("onRentToday", onRentToday);
        stats.put("approvedUpcoming", bookingRepository.countByStatus(Booking.Status.APPROVED));
        stats.put("totalReviews", reviewRepository.count());
        stats.put("totalCustomers", all.stream().map(b -> b.getCustomerEmail().toLowerCase()).distinct().count());
        stats.put("topVehicles", topVehicles(all, 4));
        return stats;
    }

    public Map<String, Object> analytics() {
        List<Booking> all = bookingRepository.findAll();
        List<Booking> valid = all.stream().filter(AnalyticsService::counts).collect(Collectors.toList());

        double revenue = all.stream().mapToDouble(AnalyticsService::paidAmount).sum();
        long completed = all.stream().filter(b -> b.getStatus() == Booking.Status.COMPLETED).count();
        long closed = all.stream().filter(b -> b.getStatus() == Booking.Status.COMPLETED
                || b.getStatus() == Booking.Status.CANCELLED || b.getStatus() == Booking.Status.REJECTED).count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBookings", all.size());
        result.put("totalRevenue", revenue);
        result.put("averageBookingValue", valid.isEmpty() ? 0 : valid.stream().mapToDouble(Booking::getTotal).average().orElse(0));
        result.put("completionRate", closed == 0 ? 0 : Math.round(completed * 1000.0 / closed) / 10.0);

        // Last 6 months, by pick-up month
        List<Map<String, Object>> monthly = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            List<Booking> inMonth = valid.stream()
                    .filter(b -> YearMonth.from(b.getPickupDate()).equals(ym))
                    .collect(Collectors.toList());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear());
            row.put("bookings", inMonth.size());
            row.put("revenue", inMonth.stream().mapToDouble(Booking::getTotal).sum());
            monthly.add(row);
        }
        result.put("monthly", monthly);

        List<Map<String, Object>> top = topVehicles(all, 5);
        result.put("topVehicles", top);

        Map<String, Long> byType = valid.stream()
                .collect(Collectors.groupingBy(b -> b.getVehicle().getType(), TreeMap::new, Collectors.counting()));
        result.put("bookingsByType", byType);

        long withDriver = valid.stream().filter(b -> b.getDriverType() == Booking.DriverType.WITH_DRIVER).count();
        result.put("withDriverPercent", valid.isEmpty() ? 0 : Math.round(withDriver * 100.0 / valid.size()));

        result.put("totalReviews", reviewRepository.count());
        result.put("averageRating", reviewRepository.findAll().stream()
                .mapToInt(r -> r.getVehicleRating()).average().orElse(0));
        result.put("insights", insights(monthly, top, byType, valid));
        return result;
    }

    private List<Map<String, Object>> topVehicles(List<Booking> all, int limit) {
        Map<Vehicle, List<Booking>> byVehicle = all.stream()
                .filter(AnalyticsService::counts)
                .collect(Collectors.groupingBy(Booking::getVehicle));
        return byVehicle.entrySet().stream()
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name", e.getKey().getName());
                    row.put("bookings", e.getValue().size());
                    row.put("revenue", e.getValue().stream().mapToDouble(Booking::getTotal).sum());
                    row.put("rating", e.getKey().getRating());
                    return row;
                })
                .sorted((a, b) -> Double.compare((double) b.get("revenue"), (double) a.get("revenue")))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> insights(List<Map<String, Object>> monthly, List<Map<String, Object>> top,
                                               Map<String, Long> byType, List<Booking> valid) {
        List<Map<String, String>> list = new ArrayList<>();
        if (valid.isEmpty()) {
            list.add(insight("No data yet", "Insights will appear once customers start booking."));
            return list;
        }

        double last = (double) monthly.get(monthly.size() - 1).get("revenue");
        double prev = (double) monthly.get(monthly.size() - 2).get("revenue");
        if (prev > 0) {
            double change = (last - prev) * 100 / prev;
            list.add(insight("Revenue this month", String.format("Revenue %s by %.1f%% compared to last month",
                    change >= 0 ? "increased" : "decreased", Math.abs(change))));
        } else {
            list.add(insight("Revenue this month", String.format("₹%,.0f booked this month", last)));
        }

        if (!top.isEmpty()) {
            Map<String, Object> best = top.get(0);
            list.add(insight("Top earner", String.format("%s earned the most revenue (₹%,.0f from %d bookings)",
                    best.get("name"), (double) best.get("revenue"), (int) best.get("bookings"))));
        }

        byType.entrySet().stream().max(Map.Entry.comparingByValue()).ifPresent(e ->
                list.add(insight("Most booked type", String.format("%s vehicles account for %d%% of bookings",
                        e.getKey(), Math.round(e.getValue() * 100.0 / valid.size())))));

        double avgDays = valid.stream().mapToInt(Booking::getDays).average().orElse(0);
        list.add(insight("Typical rental length", String.format("Customers rent for %.1f days on average", avgDays)));
        return list;
    }

    private static Map<String, String> insight(String title, String text) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("title", title);
        m.put("text", text);
        return m;
    }
}

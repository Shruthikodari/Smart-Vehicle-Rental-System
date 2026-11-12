package com.sms.vehiclerentalsystem.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    // PENDING -> APPROVED -> ONGOING -> COMPLETED, or PENDING -> REJECTED, or PENDING/APPROVED -> CANCELLED
    public enum Status { PENDING, APPROVED, ONGOING, COMPLETED, REJECTED, CANCELLED }
    public enum DriverType { SELF_DRIVE, WITH_DRIVER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingCode;

    @ManyToOne(optional = false)
    private Vehicle vehicle;

    @ManyToOne
    private Driver driver;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    private String customerPhone;

    @Column(nullable = false)
    private LocalDate pickupDate;

    @Column(nullable = false)
    private LocalDate returnDate;

    private int days;

    @Enumerated(EnumType.STRING)
    private DriverType driverType;

    private double basePrice;
    private double taxes;
    private double driverCost;
    private double total;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String adminNote;

    private boolean reminderSent;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    @OneToOne(mappedBy = "booking")
    private Review review;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public DriverType getDriverType() { return driverType; }
    public void setDriverType(DriverType driverType) { this.driverType = driverType; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }

    public double getTaxes() { return taxes; }
    public void setTaxes(double taxes) { this.taxes = taxes; }

    public double getDriverCost() { return driverCost; }
    public void setDriverCost(double driverCost) { this.driverCost = driverCost; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public boolean isReminderSent() { return reminderSent; }
    public void setReminderSent(boolean reminderSent) { this.reminderSent = reminderSent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public Review getReview() { return review; }
    public void setReview(Review review) { this.review = review; }
}

package com.sms.vehiclerentalsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "drivers")
public class Driver {

    // PENDING = registered themselves and waiting for admin approval
    public enum Status { PENDING, ACTIVE, BLOCKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String email;
    private String licenseNumber;
    private double rating = 5.0;
    private int trips;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    // Login account for the driver portal
    @JsonIgnore
    @OneToOne
    private User account;

    public Driver() {}

    public Driver(String name, String phone, String email, String licenseNumber, double rating, int trips) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.licenseNumber = licenseNumber;
        this.rating = rating;
        this.trips = trips;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getTrips() { return trips; }
    public void setTrips(int trips) { this.trips = trips; }

    public User getAccount() { return account; }
    public void setAccount(User account) { this.account = account; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}

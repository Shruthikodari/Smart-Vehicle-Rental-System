package com.sms.vehiclerentalsystem.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    public enum Status { AVAILABLE, BOOKED, MAINTENANCE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String brand;

    // CAR, SUV, BIKE, LUXURY, EV
    @NotBlank
    private String type;

    @Column(length = 500)
    private String imageUrl;

    @Positive
    private double pricePerDay;

    private double rating;

    // kmpl for fuel vehicles, km per charge for EVs
    private double mileage;

    private String fuelType;
    private String transmission;
    private int seatingCapacity;
    private String location;

    @Enumerated(EnumType.STRING)
    private Status status = Status.AVAILABLE;

    public Vehicle() {}

    public Vehicle(String name, String brand, String type, String imageUrl, double pricePerDay, double rating,
                   double mileage, String fuelType, String transmission, int seatingCapacity, String location) {
        this.name = name;
        this.brand = brand;
        this.type = type;
        this.imageUrl = imageUrl;
        this.pricePerDay = pricePerDay;
        this.rating = rating;
        this.mileage = mileage;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.seatingCapacity = seatingCapacity;
        this.location = location;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(double pricePerDay) { this.pricePerDay = pricePerDay; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public double getMileage() { return mileage; }
    public void setMileage(double mileage) { this.mileage = mileage; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}

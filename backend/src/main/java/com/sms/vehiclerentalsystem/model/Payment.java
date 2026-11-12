package com.sms.vehiclerentalsystem.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    public enum Method { UPI, CARD, CASH }
    public enum Status { PAID, PENDING, REFUNDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private Booking booking;

    private double amount;

    @Enumerated(EnumType.STRING)
    private Method method;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(unique = true)
    private String transactionId;

    private LocalDateTime paidAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public Method getMethod() { return method; }
    public void setMethod(Method method) { this.method = method; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}

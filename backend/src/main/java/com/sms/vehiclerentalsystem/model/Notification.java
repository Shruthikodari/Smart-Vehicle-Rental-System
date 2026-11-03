package com.sms.vehiclerentalsystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    public enum Type { INFO, SUCCESS, WARNING, REMINDER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private Type type;

    private String title;

    @Column(length = 500)
    private String message;

    private String bookingCode;

    @Column(name = "is_read")
    private boolean read;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(User user, Type type, String title, String message, String bookingCode) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.bookingCode = bookingCode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

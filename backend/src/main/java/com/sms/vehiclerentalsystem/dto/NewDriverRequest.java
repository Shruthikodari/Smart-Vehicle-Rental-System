package com.sms.vehiclerentalsystem.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

// Admin form for adding a driver together with their driver-portal login
public class NewDriverRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Pattern(regexp = "\\d{10}", message = "must be a 10-digit mobile number")
    private String phone;

    @NotBlank
    @Email
    private String email;

    private String licenseNumber;

    @NotBlank
    @Size(min = 6, message = "must be at least 6 characters")
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

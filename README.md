# SmartRide – Smart Vehicle Rental System

A full-stack vehicle rental platform built with **React (Vite)** and **Spring Boot**. Customers browse cars, bikes, SUVs, luxury cars and EVs, check live availability, and request a booking with or without a driver. Every booking is reviewed by an admin and then moves through its rental lifecycle. When the rental is over, customers get notifications and can leave a review.

## Application Flow

```
Home → Browse / Search / Filter → Vehicle Details (+ reviews)
     → Login / Register → Select Dates → Check Availability
          ├─ Unavailable → choose other dates
          └─ Available → Self Drive | With Driver (check & assign free driver)
     → Price calculated on server → Payment → Booking created as PENDING
     → Admin Review ── Reject → REJECTED (payment refunded)
                    └─ Approve → APPROVED → pickup day → ONGOING → return day → COMPLETED
     → Rental History · Notifications · Review (updates vehicle & driver ratings)
```

## Features

**Customer**
- Browse vehicles, search by name, brand or area, filter by type (Car / SUV / Bike / Luxury / EV)
- Vehicle details page with specs, rating and customer reviews
- Login / Register (required to book; returns the customer to the vehicle afterwards)
- Live availability check, plus a driver availability check for with-driver bookings
- Price breakdown (base + driver charges + 5% tax), calculated on the server
- Pay by UPI or card (simulated), or cash on pickup
- **Customer Dashboard:** stats, notifications, current bookings with a status timeline, rental history, cancellation, receipt download
- **Reviews:** rate a completed rental (vehicle and driver, with a comment); ratings update automatically

**Admin** (`/admin-login`)
- Dashboard: bookings, revenue collected, vehicles available today, pending reviews, rentals in progress, top vehicles
- Vehicle management: add, edit, delete, mark as under maintenance
- Driver management: add, block or unblock, see trip counts and ratings
- Booking management: approve or reject requests (with a reason sent to the customer), start rentals, complete rentals, cancel bookings, filter by status
- Analytics: 6-month trend, top vehicles by revenue, bookings by vehicle type, average rating, recent reviews, auto-generated insights

**Engineering highlights**
- **Booking state machine:** PENDING → APPROVED → ONGOING → COMPLETED (or REJECTED / CANCELLED); invalid jumps are refused by the server
- **Double-booking prevention:** date-overlap check plus a pessimistic row lock on the vehicle inside a transaction, so two simultaneous requests cannot book the same dates
- **Server-side pricing:** totals are never trusted from the client
- **Scheduled job (hourly):** starts approved rentals on the pick-up day, completes ongoing rentals after the return day, expires pending requests nobody reviewed in time, and sends pickup reminders the day before
- **Notifications:** stored in the database for every status change
- **Security:** BCrypt password hashing, token-based sessions, customers can only see and change their own bookings, role-based access to all `/admin/**` APIs
- **Validation and errors:** Bean Validation on requests, global exception handler with readable messages
- **Tests:** JUnit 5 + Spring Boot tests covering the booking lifecycle, overlaps, refunds, reviews and the scheduler

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, React Router 7, Axios, Vite |
| Backend  | Java 8, Spring Boot 2.7 (Web, Data JPA, Validation, Scheduling), Spring Security Crypto (BCrypt) |
| Database | H2 (file-based, default) or MySQL 8 |
| Build    | Maven (wrapper included), npm |
| Testing  | JUnit 5, Spring Boot Test |

## Architecture

```
React (Vite :5173)  ──/api/*──►  Vite proxy  ──►  Spring Boot (:8080)
                                                   ├── controller  (REST endpoints)
                                                   ├── service     (booking lifecycle, pricing, reviews, notifications, analytics)
                                                   ├── repository  (Spring Data JPA)
                                                   ├── model       (JPA entities)
                                                   └── config      (auth interceptor, CORS, data seeder)
                                                          │
                                                          ▼
                                                  H2 / MySQL database
```

**Entities:** `User` (customer/admin) · `Vehicle` · `Driver` · `Booking` (→ Vehicle, Driver, User) · `Payment` (1–1 with Booking) · `Review` (1–1 with a completed Booking) · `Notification` (→ User)

## Running the Project

**Requirements:** Java 8 or newer, Node.js 18 or newer. Maven is not needed because the wrapper is included.

### 1. Start the backend
```bash
cd backend
mvnw spring-boot:run          # Windows
./mvnw spring-boot:run        # macOS / Linux
```
The backend runs on http://localhost:8080. On the first run it creates the database in `backend/data/` and fills it with sample customers, vehicles, drivers, about 6 months of bookings, reviews and notifications.

### 2. Start the frontend (in a new terminal)
```bash
npm install
npm run dev
```
Open http://localhost:5173

### Demo accounts
| Role | Login | Where |
|------|-------|-------|
| Admin | `admin@smartride.com` / `admin1234` | `/admin-login` |
| Customer (has pending, approved and completed bookings, plus a rental waiting for a review) | `demo@smartride.com` / `demo1234` | `/login` |
| Other sample customers | e.g. `rahul@example.com` / `password123` | `/login` |

### Run the tests
```bash
cd backend
mvnw test
```

### Using MySQL instead of H2
1. Start MySQL and set your username and password in `backend/src/main/resources/application-mysql.properties`
2. Run `mvnw spring-boot:run -Dspring-boot.run.profiles=mysql` (the `smartride` database is created automatically)

### Reset the sample data
Stop the backend, delete the `backend/data` folder, and start it again.

The H2 database console is at http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/smartride`, user `sa`, no password).

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a customer |
| POST | `/auth/login/user` | Customer login → token |
| POST | `/auth/login/admin` | Admin login → token |
| GET | `/vehicles` | List vehicles |
| GET | `/vehicles/{id}` | Vehicle details |
| GET | `/vehicles/{id}/availability?from=&to=` | Vehicle and driver availability for these dates |
| GET | `/vehicles/{id}/reviews` | Customer reviews of a vehicle |
| POST | `/bookings` | Create a PENDING booking and its payment 👤 |
| GET | `/bookings/my` | Logged-in customer's bookings 👤 |
| GET | `/bookings/{code}` | One of your bookings 👤 |
| PUT | `/bookings/{code}/cancel` | Cancel your booking 👤 |
| GET | `/me/dashboard` | Customer dashboard stats 👤 |
| GET | `/notifications` | Your notifications 👤 |
| PUT | `/notifications/{id}/read`, `/notifications/read-all` | Mark notifications read 👤 |
| POST | `/reviews` | Review a completed rental 👤 |
| GET | `/admin/dashboard` | Dashboard stats 🔒 |
| GET | `/admin/analytics` | Analytics and insights 🔒 |
| GET | `/admin/reviews` | Latest reviews 🔒 |
| GET | `/admin/bookings` | All bookings 🔒 |
| PUT | `/admin/bookings/{id}/status` | `{status, note}`: APPROVED / REJECTED / ONGOING / COMPLETED / CANCELLED 🔒 |
| GET/POST | `/admin/vehicles` | List / add vehicles 🔒 |
| PUT/DELETE | `/admin/vehicles/{id}` | Edit / delete a vehicle 🔒 |
| PATCH | `/admin/vehicles/{id}/status` | Set AVAILABLE / MAINTENANCE 🔒 |
| GET/POST | `/admin/drivers` | List / add drivers 🔒 |
| PUT | `/admin/drivers/{id}/toggle` | Block / unblock a driver 🔒 |

👤 = requires a logged-in customer (`Authorization: Bearer <token>`) · 🔒 = requires an admin token

## Booking Rules
- Customers must be logged in to book
- Pick-up date cannot be in the past; the return date must be after pick-up; at most 30 days
- A vehicle cannot have overlapping PENDING/APPROVED/ONGOING bookings (returning and picking up on the same day is allowed)
- Vehicles under maintenance cannot be booked
- With-driver bookings get the highest-rated active driver who is free for those dates
- Every booking starts as PENDING and needs admin approval. UPI/Card are paid upfront; cash is collected when the rental completes
- Admins can only move a booking one step at a time, and a rental cannot start before its pick-up date
- Pending requests not reviewed by the pick-up date are rejected automatically
- Rejecting or cancelling a paid booking marks the payment REFUNDED; customers can cancel only before the pick-up date
- One review per completed rental; vehicle and driver ratings are the average of their reviews

## Limitations and Future Work
- Payments are simulated; a real gateway (e.g. Razorpay) can be added in `BookingService`
- Notifications are shown in the app only; email/SMS delivery could be added
- Possible next steps: JWT with expiry, vehicle image upload, ML-based demand pricing

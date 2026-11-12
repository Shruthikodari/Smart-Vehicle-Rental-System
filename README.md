# SmartRide – Smart Vehicle Rental System

A full-stack vehicle rental platform built with **React (Vite)** and **Spring Boot**, with three roles:

- **Customers** browse cars, bikes, SUVs, luxury cars and EVs, book with or without a driver, and review their trips.
- **Admins** approve bookings and driver registrations, and manage vehicles, drivers and customers.
- **Drivers** see the trips assigned to them, start and end each trip, and track their earnings.

## Roles and Flows

### Customer
```
Landing → Home (browse as a guest) → Vehicle Details → "Book now"
   → not logged in? → Login / Register → straight back to the Booking page
   → Booking (dates, driver, live availability, price) → Payment → Confirmation (PENDING)
   → History → Booking Details → Review
```

### Admin
```
Admin Login → Dashboard → Vehicle / Driver / User Management
   → Booking Management → Approve / Reject → Analytics · Reports · Notifications
```

### Driver
```
Driver Register → (admin approves) → Driver Login → Dashboard → Assigned trips
   → Start trip → ONGOING → End trip → COMPLETED → Earnings + history
```

### Booking lifecycle
```
PENDING ──admin approves──► APPROVED ──driver / admin starts──► ONGOING ──driver / admin ends──► COMPLETED
   │                           │
   └─admin rejects─► REJECTED  └─customer / admin cancels─► CANCELLED   (paid bookings are refunded)
```
If nobody acts, an hourly job starts approved rentals on the pick-up day, completes them after the return day, and expires requests that were never reviewed.

## Pages

| Customer | Admin | Driver |
|---|---|---|
| `/` Landing | `/admin/login` | `/driver/register` |
| `/home` Browse vehicles | `/admin/dashboard` | `/driver/login` |
| `/vehicle/:id` Vehicle details | `/admin/vehicles` | `/driver/dashboard` |
| `/login`, `/register` | `/admin/drivers` (approve registrations) | `/driver/bookings` Assigned trips |
| `/booking/:id` Booking | `/admin/users` | `/driver/trips/:id` Trip details |
| `/payment/:id` Payment | `/admin/bookings` (approve / reject) | `/driver/earnings` |
| `/confirmation` | `/admin/analytics` | `/driver/profile` |
| `/history` My bookings | `/admin/reports` (CSV export) | |
| `/history/:code` Booking details | `/admin/notifications` | |
| `/reviews`, `/reviews/:code` | | |
| `/profile`, `/notifications` | | |

## Features

**Customer**
- Browse vehicles, search by name, brand or area, filter by city and type, sort by price or rating
- Vehicle details with specs and customer reviews; guests can look around, and booking asks them to log in first
- Live availability check, plus a driver availability check for with-driver bookings
- Price breakdown (base + driver charges + 5% tax), calculated on the server
- Pay by UPI or card (simulated), or cash on pickup
- My bookings with status timeline, booking details, cancellation, receipt download
- Notifications for every status change, reviews for completed trips, profile and password change

**Admin**
- Dashboard: bookings, revenue, vehicles free today, pending approvals, rentals in progress, top vehicles
- Vehicles: add, edit, delete, take out of service
- Drivers: approve or reject self-registered drivers, add drivers (with a login), block or unblock
- Users: customer list with booking activity, block or unblock (a blocked customer is logged out and can't log in)
- Bookings: tabs (needs action, approved, on rent, completed and so on), search, approve, reject with a reason, start, complete, cancel
- Analytics (trends, insights, reviews), Reports (any date range, by vehicle / driver / payment method, CSV download)
- Notifications for new booking requests, driver registrations, and rentals starting and ending

**Driver**
- Register, then log in once an admin approves the account
- Dashboard with today's trips and "new trip assigned" notifications
- Assigned trips with start and end trip buttons (only for their own trips, and only from the pick-up date)
- Trip details with customer contact and payment to collect, earnings by month, profile and password

**Engineering highlights**
- **Role-based access:** separate logins for customers, admins and drivers; the server checks the role on every `/admin/**`, `/driver/**` and customer request
- **Booking state machine:** invalid jumps (for example completing a booking that was never approved) are refused by the server
- **Double-booking prevention:** date-overlap check plus a pessimistic row lock on the vehicle inside a transaction
- **Server-side pricing:** totals are never trusted from the client
- **Scheduled job (hourly):** starts, completes and expires bookings, and sends pickup reminders
- **Security:** BCrypt password hashing, token sessions, blocked accounts lose their session, customers and drivers only see their own data
- **Tests:** JUnit 5 + Spring Boot tests for the booking lifecycle, overlaps, refunds, reviews, the scheduler, role logins, account blocking and driver permissions

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

**Entities:** `User` (customer / admin / driver login) · `Vehicle` · `Driver` (→ its User login) · `Booking` (→ Vehicle, Driver, User) · `Payment` (1–1 with Booking) · `Review` (1–1 with a completed Booking) · `Notification` (→ User)

## Running the Project

**Requirements:** Java 8 or newer, Node.js 18 or newer. Maven is not needed because the wrapper is included.

### Start the application
```bash
npm install
npm run dev
```
`npm run dev` starts the backend, waits for the vehicle API to respond, and then starts the frontend. On the first run, the backend creates the database in `backend/data/` and fills it with sample customers, vehicles, drivers, about 6 months of bookings, reviews and notifications. Open http://localhost:5173.

To run the backend and frontend separately, start the backend with `cd backend` followed by `mvnw spring-boot:run` on Windows or `./mvnw spring-boot:run` on macOS/Linux, then run `npm run dev:frontend` from the project root.

### Demo accounts
| Role | Login page | Email | Password |
|------|-----------|-------|----------|
| Admin | `/admin/login` | `admin@smartride.com` | `admin1234` |
| Customer (has bookings in every state, plus a trip to review) | `/login` | `demo@smartride.com` | `demo1234` |
| Other customers | `/login` | `rahul@example.com`, `ananya@example.com`, ... | `password123` |
| Drivers | `/driver/login` | `raj@smartride.com`, `priya@smartride.com`, `arjun@smartride.com`, `neha@smartride.com`, `imran@smartride.com` | `driver123` |
| Driver waiting for approval | (approve in `/admin/drivers`) | `suresh@smartride.com` | `driver123` |

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
| POST | `/auth/register/driver` | Driver registration (waits for admin approval) |
| POST | `/auth/login/driver` | Driver login → token |
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
| GET/PUT | `/me/profile` | View / update name and phone 👤 |
| PUT | `/me/password` | Change password 👤 |
| GET | `/me/reviews` | Your reviews 👤 |
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
| PUT | `/admin/drivers/{id}/approve`, `/reject` | Approve / reject a driver registration 🔒 |
| PUT | `/admin/drivers/{id}/toggle` | Block / unblock a driver 🔒 |
| GET | `/admin/users` | Customers with booking activity 🔒 |
| PUT | `/admin/users/{id}/toggle` | Block / unblock a customer 🔒 |
| GET | `/admin/notifications` | Admin notifications 🔒 |
| GET | `/driver/me` | Driver stats and today's trips 🚗 |
| GET | `/driver/bookings`, `/driver/bookings/{id}` | Assigned trips / one trip 🚗 |
| PUT | `/driver/bookings/{id}/start`, `/complete` | Start / end a trip 🚗 |
| PUT | `/driver/profile`, `/driver/password` | Update profile / change password 🚗 |
| GET | `/driver/notifications` | Driver notifications 🚗 |

👤 = customer login · 🔒 = admin login · 🚗 = driver login (all send `Authorization: Bearer <token>`)

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

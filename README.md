# Reservation API
This is a simple Reservation API built with NestJS. It allows for 
- initializing tables
- reserving tables for customers
- canceling reservations
- retrieving all reservations.

## Prerequisites
- Node.js (version 18 or higher)
- Docker (if you want to run the project using Docker)

## 1. Installation

```bash
$ npm install
```

## 2. Running the app

There are 2 options for running application 

### 2.1 with docker
```bash
$ docker compose up --build
```

### 2.2 without docker
```bash
$ npm start
```


<br>

#### After startup is done, the application will be available at http://localhost:3000/api.

<br> 
<br> 
<br> 


# API Endpoints



1. ### Initialize Tables
- **URL:** `/reservations/initialize`
- **Method:** `POST`
- **Query Parameters:**
  - `totalTables` (number): The total number of tables to initialize.
- **Responses:**
  - `201 Created`: Tables have been initialized.
  - `400 Bad Request`: Invalid parameters or tables already initialized.

<br>

---

2. ### Reserve Tables 

- **URL:** `/reservations/reserve`
- **Method**: `POST`
- **Query Parameters**:
  - `customers` (number): The number of customers to reserve tables for.
- **Response**s:
  - `200 OK`: Tables have been reserved.
  - `400 Bad Request`: Invalid parameters or not enough tables available.

<br>

---

3. ### Cancel Reservation

- **URL:** `/reservations/cancel`
- **Method:** POST
- **Query Parameters:**
  - `bookingId` (string): The ID of the booking to cancel.
- **Responses:**
  - `200 OK`: Reservation has been cancelled.
  - `404 Not Found`: Booking ID not found.

<br>

---

4. ### Get All Reservations

- **URL:** `/reservations/all-reservations`
- **Method:** GET
- **Responses:**
  - `200 OK`: Returns all reservations.
  - `404 Not Found`: No reservations found.

<br>

<br><br>

# Test 

#### you can use the command below for testing spec files

```bash
$ npm test
```

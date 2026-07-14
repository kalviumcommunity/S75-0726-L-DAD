# L-DAD - Logistics Delay Analytics Dashboard

> A MERN Stack web application for centralized shipment tracking, delay management, warehouse transfer monitoring, and operational reporting.

---

## Table of Contents

- Project Overview
- Problem Statement
- Proposed Solution
- Objectives
- Features
- System Workflow
- System Architecture
- Technology Stack
- Database Schema
- Folder Structure
- Installation
- Environment Variables
- Running the Application
- API Endpoints
- User Roles
- Functional Requirements
- Non-Functional Requirements
- Screenshots
- Future Enhancements
- Success Metrics
- Contributors
- License

---

# Project Overview

## About

L-DAD (Logistics Delay Analytics Dashboard) is a centralized logistics management system built using the MERN Stack.

The application combines shipment information, warehouse transfers, and delay reports into a single dashboard, making it easier for logistics teams to monitor shipment progress and generate operational reports.

Instead of maintaining multiple spreadsheets and disconnected systems, L-DAD provides a single platform for shipment visibility.

---

# Problem Statement

Many logistics companies maintain shipment scans, warehouse transfers, and delay reports across different systems.

Because these systems are disconnected, logistics teams face several challenges:

- Delays are noticed only after customer complaints.
- Shipment history is difficult to track.
- Warehouse bottlenecks remain unnoticed.
- Reporting takes significant manual effort.
- Decision-making becomes reactive.

---

# Proposed Solution

L-DAD centralizes logistics data into one application where users can

- Track shipments
- Update shipment status
- Record warehouse transfers
- Maintain delay reports
- Monitor operational performance
- Export reports

This provides complete shipment visibility from dispatch to delivery.

---

# Objectives

The project aims to:

- Centralize logistics information
- Improve shipment visibility
- Reduce dependency on spreadsheets
- Simplify operational reporting
- Monitor shipment delays
- Improve operational decision making

---

# Features

## Authentication

- JWT Login
- Role-based access

---

## Shipment Management

- Create shipment
- Update shipment
- Delete shipment
- View shipment

Shipment Status

```
Dispatched
      ↓
In Transit
      ↓
At Warehouse
      ↓
Delayed
      ↓
Delivered
```

---

## Warehouse Transfer

- Record transfers
- Track warehouse movement

---

## Delay Reports

- Add delay reason
- Update delay report
- View delayed shipments

---

## Shipment Timeline

Displays all shipment activities ordered by timestamp.

Example

```
Dispatched

↓

Warehouse Scan

↓

Warehouse Transfer

↓

Delay Report

↓

Delivered
```

---

## Dashboard

Displays

- Total Shipments
- Delayed Shipments
- Delivered Shipments
- Shipment Status Counts
- Delay Reasons Chart
- Average Delivery Time

---

## Reports

- Export shipment data to CSV

---

# System Workflow

```
User Login
      │
      ▼
Dashboard
      │
      ├──────────────┐
      ▼              ▼
Shipments      Delay Reports
      │              │
      ▼              ▼
Warehouse Transfers
      │
      ▼
Timeline
      │
      ▼
Dashboard Analytics
      │
      ▼
CSV Export
```

---

# System Architecture

```
                 React Frontend

                        │

                 REST API (Express)

                        │

             Business Logic Layer

                        │

                MongoDB Database
```

---

# Technology Stack

## Frontend

- React
- React Router
- CSS
- Recharts

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## Export

- json2csv

---

# Database Schema

## User

| Field | Type |
|--------|------|
| Name | String |
| Email | String |
| Password | String |
| Role | Manager / Analyst / Coordinator |

---

## Shipment

| Field | Type |
|--------|------|
| shipmentId | String |
| origin | String |
| destination | String |
| status | String |
| dispatchDate | Date |
| deliveryDate | Date |

---

## Warehouse Transfer

| Field | Type |
|--------|------|
| shipmentId | String |
| fromWarehouse | String |
| toWarehouse | String |
| timestamp | Date |

---

## Delay Report

| Field | Type |
|--------|------|
| shipmentId | String |
| reason | String |
| timestamp | Date |

---

# Folder Structure

```text
L-DAD/

├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── README.md
└── .env
```

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Backend

```bash
cd server
npm install
```

Frontend

```bash
cd client
npm install
```

---

# Environment Variables

```env
PORT=

MONGO_URI=

JWT_SECRET=
```

---

# Running the Project

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

## Shipments

```
GET /api/shipments
POST /api/shipments
PUT /api/shipments/:id
DELETE /api/shipments/:id
```

## Warehouse Transfers

```
GET /api/transfers
POST /api/transfers
```

## Delay Reports

```
GET /api/delays
POST /api/delays
```

## Dashboard

```
GET /api/dashboard
```

## Export

```
GET /api/export/csv
```

---

# User Roles

| Role | Responsibilities |
|------|------------------|
| Operations Manager | Monitor shipment status and download reports |
| Logistics Analyst | Analyze shipment trends and generate reports |
| Delivery Coordinator | Update shipment status and warehouse transfers |

---

# Functional Requirements

- CRUD operations for shipments
- CRUD operations for warehouse transfers
- CRUD operations for delay reports
- Dashboard analytics
- Shipment timeline
- CSV export

---

# Non-Functional Requirements

### Performance

Dashboard should load efficiently for small and medium datasets.

### Security

JWT Authentication and password encryption.

### Scalability

Supports future expansion with standard MongoDB collections.

### Usability

Responsive React interface with simple navigation.

---

# Screenshots

> Add application screenshots here.

- Login Page
- Dashboard
- Shipments
- Timeline
- Reports

---

# Future Enhancements

- Real-time notifications
- Predictive delay analytics
- Route optimization
- Interactive maps
- PDF reports
- Mobile application

---

# Success Metrics

- Centralized shipment tracking
- Faster visibility of delays
- Reduced manual reporting
- Improved operational efficiency

---

# Contributors

Dhanya Lakshmi S S

---

# License

This project is licensed under the MIT License.
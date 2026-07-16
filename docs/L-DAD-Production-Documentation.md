# L-DAD (Logistics Delay Analytics Dashboard) — Production Project Documentation

> MERN stack application documentation for centralized shipment tracking, delay management, warehouse transfer monitoring, and operational reporting.

[![MERN](https://img.shields.io/badge/Stack-MERN-informational?style=flat)](#)
[![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat)](#license)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Objectives](#objectives)
- [Features](#features)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [System Workflow](#system-workflow)
- [System Architecture Diagram](#system-architecture-diagram)
- [Folder Structure Documentation](#folder-structure-documentation)
- [Tech Stack Explanation](#tech-stack-explanation)
- [User Roles and Responsibilities](#user-roles-and-responsibilities)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [Future Enhancements](#future-enhancements)
- [Project Timeline (Optional)](#project-timeline-optional)
- [Development Guidelines](#development-guidelines)

---

## Project Overview

**L-DAD (Logistics Delay Analytics Dashboard)** is a logistics operations web platform built on the **MERN stack**. It provides a single operational workspace to:

- Track shipment lifecycle and current operational status
- Record warehouse transfer events between facilities
- Capture delay reports (reason/category + timestamp)
- Produce analytics for operational decision-making
- Export shipment data for reporting workflows

The core design philosophy is **operational visibility**: rather than scattered spreadsheets or disconnected systems, L-DAD centralizes logistics data and exposes it through a consistent, role-aware API and dashboard UI.

---

## Problem Statement

Many logistics teams manage shipment scans and operational events across multiple systems and manual spreadsheets. This fragmentation causes:

- **Reactive delay management**: delays are discovered only after customer escalation.
- **Poor traceability**: shipment history is hard to reconstruct.
- **Warehouse bottleneck blind spots**: transfer congestion and movement patterns are not analyzed.
- **High reporting effort**: analytics and exports require manual data preparation.
- **Delayed decision-making**: operational decisions are made without timely, consolidated context.

---

## Proposed Solution

L-DAD centralizes logistics operations data into a web application that:

1. Stores shipment *current state* for fast reads.
2. Stores warehouse transfers and delay reports as *append-only operational events*.
3. Exposes a REST API that supports dashboard aggregates and detailed drill-down views.
4. Provides an authenticated, role-aware UI with filters, analytics, timelines, and CSV export.

This enables complete visibility from dispatch to delivery and improves both operational execution and reporting accuracy.

---

## Objectives

- **Centralize logistics information** in a single source of truth.
- **Improve shipment visibility** through status-centric dashboards.
- **Reduce spreadsheet dependency** by providing built-in data capture and reporting.
- **Simplify analytics** with dashboard KPIs and delay breakdowns.
- **Accelerate operational decision-making** with time-based timelines and exports.
- **Maintain auditability** using event history (transfers and delays).

---

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes in the frontend and protected endpoints in the backend

### Shipment Management
- Create shipment records
- Update shipment status and relevant dates
- View shipment details
- Timeline view (chronological drill-down across related operational events)

Shipment status lifecycle (business view):

```text
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

### Warehouse Transfers
- Record transfers as operational history events
- Query transfers by shipment and filters for operational reporting

### Delay Reports
- Create delay reports with category and operational reason
- View delay events and filter by shipment/category/time window

### Dashboard Analytics
- KPI overview (total shipments, delayed shipments, delivered shipments, etc.)
- Status counts distribution
- Delay reasons breakdown
- Average delivery time analytics (delivered shipments)

### Reporting & Export
- CSV export of shipment data (parameterized by filters)

---

## Functional Requirements

### Authentication / User Management
- Support user login and JWT issuance.
- Provide an authenticated endpoint to retrieve the current user profile.
- Support password change functionality for authenticated users.

### Shipments
- CRUD operations must support role-based write access.
- Shipment status updates must enforce business validation rules.
- Timeline retrieval must combine shipment + related event history.
- Shipment listing must support filtering, sorting, pagination, and search where applicable.

### Warehouse Transfers
- Create transfer events for an existing shipment.
- Transfers are treated as append-only operational history.
- Provide listing endpoints with filtering and pagination.
- Provide retrieval of transfers by shipment.

### Delay Reports
- Create delay reports for an existing shipment.
- Delay reports are treated as append-only operational history.
- Provide listing and retrieval by shipment.
- Enforce delay category + reason validation.

### Dashboard
- Provide read-only KPI endpoints optimized for UI charts/cards.
- Support optional date-range filtering where relevant.

### Reports
- Provide CSV export of shipment datasets.
- Export must respect role permissions and filter constraints.

---

## Non-Functional Requirements

### Security
- JWT authentication required for protected endpoints.
- Passwords must be stored securely (hashing) and never returned.
- Authorization checks must enforce RBAC at the API layer.
- Input validation must prevent invalid business state transitions.

### Performance
- Dashboard endpoints must be optimized for KPI retrieval (aggregations and indexed queries).
- Transfers and delays must support pagination and appropriate sorting.
- CSV export should stream/efficiently generate large datasets.

### Scalability
- MongoDB schema design supports event growth while maintaining fast dashboard reads.
- Indexing strategy should support filters and time-based queries.
- The API should remain extendable for future reporting modules.

### Reliability & Maintainability
- Consistent API response envelopes and error catalog.
- Layered architecture separation (HTTP layer, middleware, controllers/services, persistence).
- Domain-first modular structure on backend and feature-based organization on frontend.

### Usability
- Responsive UI for enterprise usage.
- Clear status indicators and drill-down interactions.

---

## System Workflow

### High-level user workflow

```text
User Login
   │
   ▼
Dashboard
   │
   ├──────────────┐
   ▼              ▼
Shipments       Delay Reports
   │              │
   ▼              ▼
Warehouse Transfers
   │
   ▼
Timeline / Drill-down
   │
   ▼
Dashboard Analytics + CSV Export
```

### Event-driven workflow (append-only history)

```text
Shipment Created/Updated
   │
   ├─> Warehouse Transfer Event (append)
   │
   └─> Delay Report Event (append)

Dashboard Aggregates computed from Shipment state + event history
```

---

## System Architecture Diagram

### Component architecture

```mermaid
flowchart TB
  U[Users / Operations Team] -->|JWT| F[React Frontend (Vite + TS)]
  F -->|REST + CSV requests| A[Express REST API]
  A --> M[Middleware (Auth, Validation, RBAC)]
  A --> C[Controllers / Services (Domain Logic)]
  C --> DB[(MongoDB)]
  DB --> IDX[(Indexed Collections)]
  A --> R[Exports (CSV Streaming)]
```

### Data organization (conceptual)

```mermaid
flowchart LR
  S[Shipments (current state)]
  T[Warehouse Transfers (events)]
  D[Delay Reports (events)]

  T --> S
  D --> S
```

---

## Folder Structure Documentation

> The repo is organized as a **monorepo** with separate `client/` and `server/` packages.

### Root

```text
L-DAD/
  client/
  server/
  docs/
  README.md (root overview)
  TODO.md
```

### Frontend (client)

```text
client/src/
  App.tsx
  main.tsx
  index.css

  assets/
  components/
  constants/
  context/
  features/
  hooks/
  layouts/
  pages/
  routing/
  services/
  styles/
  utils/
```

Key frontend principles (as implemented conceptually):
- **Feature-based** organization under `client/src/features/*`.
- Reusable UI components under `client/src/components/common/*`.
- API calls isolated under `client/src/services/api/*`.
- Auth and cross-cutting state managed through React Context.

### Backend (server)

```text
server/src/
  index.js
  server.js

  config/
  constants/
  database/
  exports/
  http/
    controllers/
    middleware/
    routes/

  middleware/
  models/
  modules/
    auth/
    delay-reports/
    reports/
    shipments/
    warehouse-transfers/

  routes/
  uploads/
  utils/
```

Key backend principles:
- Domain modules under `server/src/modules/*`.
- Dedicated HTTP layer (`server/src/http/*`) to mount routes and middleware.
- Central model import/index for bootstrap wiring.

---

## Tech Stack Explanation

### Frontend
- **React**: UI rendering and component structure.
- **TypeScript**: type safety for domain and UI models.
- **Vite**: build tooling and dev server.
- **React Router**: protected routing and navigation.
- **Tailwind CSS**: styling utilities.
- **Charting**: commonly used for dashboard charts (e.g., Recharts or similar usage patterns).

### Backend
- **Node.js**: runtime.
- **Express**: REST API server.
- **MongoDB**: primary database.
- **Mongoose**: ODM and schema validation.
- **JWT**: authentication tokens.
- **Middleware**: request auth, RBAC checks, and validation orchestration.

### Reporting / Export
- CSV generation utility (design-oriented requirement): export shipment data as CSV.

---

## User Roles and Responsibilities

L-DAD uses a role model enforced via JWT + RBAC.

| Role | Responsibilities |
|------|-------------------|
| **Manager** | Full operational access: manage shipments, record transfers/delays, and manage reporting/export capabilities. |
| **Coordinator** | Operational write access: update shipment status and record transfers/delay reports, typically with fewer administrative permissions. |
| **Analyst** | Read-only access to analytics and operational history: dashboard insights, timeline views, and reporting outputs where allowed. |

---

## Installation Guide

### Prerequisites
- Node.js (LTS recommended)
- MongoDB (local or hosted)

### Clone

```bash
git clone <repository-url>
cd L-DAD
```

### Backend setup

```bash
cd server
npm install
```

### Frontend setup

```bash
cd ../client
npm install
```

### Run (typical)

> Exact scripts depend on package.json definitions.

```bash
# Backend
npm run dev --prefix server

# Frontend (in another terminal)
npm run dev --prefix client
```

---

## Environment Variables

L-DAD uses environment variables for configuration. Keep secrets out of source control.

### Server environment variables

From `server/src/config/env.example.js` (expected):

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
```

**Guidelines**
- `MONGO_URI`: connection string to MongoDB.
- `JWT_SECRET`: secret key for signing JWT tokens.

### Client environment variables

The client `package.json` suggests Vite usage. If Vite environment variables are needed, they typically follow the `VITE_` prefix pattern.

> If the project uses no client-specific environment variables, only server env config is required.

---

## Future Enhancements

The following are high-value extensions compatible with the current architecture philosophy:

1. **Predictive delay analytics**
   - Estimate delay probability based on historical patterns.
2. **Real-time notifications**
   - Alert managers/coordination roles when shipments enter delayed thresholds.
3. **Advanced routing / interactive maps**
   - Visualize origin/destination and warehouse network topology.
4. **Additional export formats**
   - PDF export, scheduled exports, and report sharing.
5. **Role customization / fine-grained permissions**
   - Endpoint-level permissions per organization.
6. **Audit logging improvements**
   - Enhanced change history for operational events.
7. **Data import pipelines**
   - Ingest shipments/events from external systems via CSV/API.

---

## Project Timeline (Optional)

A suggested delivery timeline for production hardening:

- **Week 1**: Requirements finalization + API contract alignment + environment setup.
- **Week 2**: Implement/verify core modules (auth, shipments, transfers, delays).
- **Week 3**: Build dashboard aggregates and timeline UI.
- **Week 4**: Reporting/export + RBAC tests + security hardening.
- **Week 5**: Performance tuning (indexes, pagination) + UX polish.
- **Week 6**: Documentation finalization + staging deployment + QA.

---

## Development Guidelines

### Documentation standards
- Keep all design decisions and business rules documented (especially validation rules).
- Update API docs whenever endpoint contracts change.

### Code organization
- Maintain domain separation:
  - Domain modules manage business logic and persistence models.
  - HTTP layer manages routing and request/response orchestration.
- Keep frontend feature-based separation:
  - UI components reusable across features should remain under `components/common`.
  - Feature-specific pages/components under `features/<feature-name>/`.

### Validation and consistency
- Enforce business validation rules consistently at the backend.
- Use consistent response envelopes and error codes.
- Ensure event append-only semantics for transfers and delay reports.

### Security practices
- Validate authorization (RBAC) at the API layer.
- Never return password hashes or secrets.
- Sanitize and validate all inputs.

### Performance practices
- Use indexes aligned with dashboard query patterns.
- Paginate list endpoints.
- Stream large exports where possible.

### Testing strategy (recommended)
- Unit tests for domain validation and aggregation logic.
- API integration tests for endpoint contracts and RBAC.
- Frontend tests for protected routing and critical UI flows.

---

## License

MIT (as applicable in the repository).


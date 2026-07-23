# L-DAD API Documentation

## Overview

This document records the currently implemented backend API surface for the Logistics Delay Analytics Dashboard (L-DAD).

Base URL:

```text
http://localhost:5000/api
```

Authentication:

```http
Authorization: Bearer <access_token>
```

## Authentication

### POST /api/auth/register
- Description: Register a new application user.
- Auth required: No
- Notes: Persists a new user record and issues a JWT token.

### POST /api/auth/login
- Description: Authenticate an existing user and return a JWT token and profile.
- Auth required: No
- Notes: Validates email and password before issuing a token.

### GET /api/auth/me
- Description: Read the authenticated user's profile.
- Auth required: Yes
- Notes: Returns the current signed-in user context.

### POST /api/auth/logout
- Description: Logout the authenticated user.
- Auth required: Yes
- Notes: The server responds successfully; the client is expected to discard the token.

## Shipments

### GET /api/shipments
- Description: List shipments with query filtering, pagination, and sort support.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`, `Analyst`

### GET /api/shipments/:id
- Description: Fetch a single shipment by shipment business key.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`, `Analyst`

### GET /api/shipments/:id/timeline
- Description: Fetch shipment activity events in chronological order.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`, `Analyst`

### POST /api/shipments
- Description: Create a shipment.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`

### PUT /api/shipments/:id
- Description: Update a shipment.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`

### PATCH /api/shipments/:id
- Description: Update a shipment using partial fields.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`

### DELETE /api/shipments/:id
- Description: Delete a shipment.
- Auth required: Yes
- Roles: `Manager`
- Notes: Deletion is blocked when dependent transfer or delay records exist.

## Dashboard

### GET /api/dashboard/summary
- Description: Returns dashboard KPI summary data plus recent shipments.
- Auth required: Not enforced in current route wiring

### GET /api/dashboard/overview
- Description: Returns dashboard overview metrics.
- Auth required: Not enforced in current route wiring

### GET /api/dashboard/status-counts
- Description: Returns shipment status counts.
- Auth required: Not enforced in current route wiring

### GET /api/dashboard/delay-breakdown
- Description: Returns grouped delay category breakdowns.
- Auth required: Not enforced in current route wiring

### GET /api/dashboard/average-delivery-time
- Description: Returns the average delivery-time metric.
- Auth required: Not enforced in current route wiring

### GET /api/dashboard/recent
- Description: Returns recent shipment activity records.
- Auth required: Not enforced in current route wiring

## Reports

### GET /api/reports/shipments/csv
- Description: Export shipment data as a CSV file.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`, `Analyst`

### GET /api/reports/delays/csv
- Description: Export delay report data as a CSV file.
- Auth required: Yes
- Roles: `Manager`, `Coordinator`, `Analyst`

## Activity Log

### GET /api/activity
- Description: Read activity log entries.
- Auth required: Yes

## Current Runtime Availability

The server currently starts the HTTP layer and exposes the routes above, but the following runtime blockers affect full live testing:

1. The MongoDB Atlas connection is unavailable from the current environment.
2. The route modules for warehouse transfers and delay reports are not yet mounted in the server build.
3. The dashboard routes are not protected by the authentication middleware, even though the shipment and report routes are.

## Verification Notes

The route inventory above was verified by reading the runtime router wiring in the server code and by probing the live server on port 5000. The live environment currently returns:

- `GET /health` → `200 OK`
- `GET /api/shipments` without token → `401 Unauthorized`
- `GET /api/dashboard/summary` with no database connectivity → `500 Internal Server Error`


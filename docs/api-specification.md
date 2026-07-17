# L-DAD REST API Specification

Version: `v1`  
Base path: `/api`  
Style: REST over JSON, with CSV streaming for report export

This document defines the intended REST API contract for the L-DAD backend. It is written as a Swagger/OpenAPI-style specification, but remains implementation-agnostic.

## 1. Global Conventions

### 1.1 Authentication

All protected endpoints require a JWT in the `Authorization` header.

```http
Authorization: Bearer <access_token>
```

### 1.2 Role Model

The schema defines three roles:

- `Manager` - full operational access
- `Coordinator` - operational write access, no destructive administration
- `Analyst` - read-only access to analytics and operational history

### 1.3 Standard Response Envelope

Successful JSON responses should follow this pattern:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error responses should follow this pattern:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 1.4 Common HTTP Status Codes

- `200 OK` - successful read or update
- `201 Created` - successful creation
- `204 No Content` - successful delete or empty response
- `400 Bad Request` - malformed request
- `401 Unauthorized` - missing or invalid token
- `403 Forbidden` - authenticated but not allowed
- `404 Not Found` - record not found
- `409 Conflict` - duplicate key or conflicting state
- `422 Unprocessable Entity` - validation failure
- `500 Internal Server Error` - unexpected failure

### 1.5 Common Pagination Query

List endpoints may support:

- `page` - page number, starts at `1`
- `limit` - page size, usually `10-100`
- `sortBy` - sortable field name
- `sortOrder` - `asc` or `desc`
- `search` - free-text search where supported

Paginated responses should include:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

---

## 2. Authentication Module

Base path: `/api/auth`

### 2.1 POST `/api/auth/login`

| Field | Specification |
| --- | --- |
| HTTP Method | `POST` |
| URL | `/api/auth/login` |
| Description | Authenticates a user and returns a JWT plus the user profile. |
| Authentication Required | No |
| User Role Access | Public |
| Request Parameters | None |
| Request Body | `email`, `password` |
| Response Format | `200` with `{ token, user }` |
| Status Codes | `200`, `400`, `401`, `422`, `429`, `500` |
| Validation Rules | `email` must be valid and lowercased; `password` is required and must not be empty. |
| Error Responses | Invalid credentials, inactive account, validation failure, rate-limit violation. |

Request body:

```json
{
  "email": "manager@ldad.com",
  "password": "Secret123!"
}
```

Response format:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "66aa1f...",
      "fullName": "Amina Khan",
      "email": "manager@ldad.com",
      "role": "Manager",
      "isActive": true
    }
  }
}
```

Error responses:

- `401 Unauthorized` when credentials are invalid.
- `403 Forbidden` when the account is inactive.
- `422 Unprocessable Entity` when `email` or `password` fails validation.

---

### 2.2 GET `/api/auth/me`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/auth/me` |
| Description | Returns the authenticated user's profile. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | None |
| Request Body | None |
| Response Format | `200` with current user object |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | Bearer token must be valid and resolve to an active user. |
| Error Responses | Missing token, invalid token, deleted or inactive user record. |

Response format:

```json
{
  "success": true,
  "data": {
    "id": "66aa1f...",
    "fullName": "Amina Khan",
    "email": "manager@ldad.com",
    "role": "Manager",
    "isActive": true,
    "createdAt": "2026-07-15T10:00:00.000Z",
    "updatedAt": "2026-07-16T08:30:00.000Z"
  }
}
```

---

### 2.3 PATCH `/api/auth/me/password`

| Field | Specification |
| --- | --- |
| HTTP Method | `PATCH` |
| URL | `/api/auth/me/password` |
| Description | Changes the authenticated user's password. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | None |
| Request Body | `currentPassword`, `newPassword` |
| Response Format | `200` with confirmation message |
| Status Codes | `200`, `400`, `401`, `422`, `500` |
| Validation Rules | `currentPassword` required; `newPassword` must satisfy password policy and differ from current password. |
| Error Responses | Incorrect current password, weak new password, invalid token. |

Request body:

```json
{
  "currentPassword": "OldSecret123!",
  "newPassword": "NewSecret123!"
}
```

Response format:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 3. Shipments Module

Base path: `/api/shipments`

Shipment resources use the business key `shipmentId` for lookup in public URLs.

### 3.1 POST `/api/shipments`

| Field | Specification |
| --- | --- |
| HTTP Method | `POST` |
| URL | `/api/shipments` |
| Description | Creates a new shipment record. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator` |
| Request Parameters | None |
| Request Body | `shipmentId`, `currentStatus`, `dispatchDate`, `expectedDeliveryDate`, optional operational fields supported by the model |
| Response Format | `201` with created shipment |
| Status Codes | `201`, `400`, `401`, `403`, `409`, `422`, `500` |
| Validation Rules | `shipmentId` is required and uppercase unique; `currentStatus` must be valid; dates must be valid ISO dates; `expectedDeliveryDate` cannot precede `dispatchDate`. |
| Error Responses | Duplicate `shipmentId`, invalid status, invalid date ordering, unauthorized access. |

Request body:

```json
{
  "shipmentId": "LDAD-SHP-10021",
  "currentStatus": "Dispatched",
  "dispatchDate": "2026-07-16T09:00:00.000Z",
  "expectedDeliveryDate": "2026-07-20T18:00:00.000Z"
}
```

Response format:

```json
{
  "success": true,
  "data": {
    "id": "66ab11...",
    "shipmentId": "LDAD-SHP-10021",
    "currentStatus": "Dispatched",
    "dispatchDate": "2026-07-16T09:00:00.000Z",
    "expectedDeliveryDate": "2026-07-20T18:00:00.000Z",
    "createdBy": "66aa1f...",
    "updatedBy": "66aa1f...",
    "createdAt": "2026-07-16T09:05:00.000Z",
    "updatedAt": "2026-07-16T09:05:00.000Z"
  }
}
```

---

### 3.2 GET `/api/shipments`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/shipments` |
| Description | Returns a paginated shipment list with optional filtering and search. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Query: `page`, `limit`, `search`, `status`, `fromDate`, `toDate`, `sortBy`, `sortOrder` |
| Request Body | None |
| Response Format | `200` with paginated shipment array |
| Status Codes | `200`, `401`, `500` |
| Validation Rules | `page` and `limit` must be positive integers; `status` must be a valid shipment status; `fromDate` and `toDate` must be valid dates and `fromDate` cannot exceed `toDate`. |
| Error Responses | Invalid query parameters, unauthorized access. |

Response format:

```json
{
  "success": true,
  "data": [
    {
      "id": "66ab11...",
      "shipmentId": "LDAD-SHP-10021",
      "currentStatus": "In Transit",
      "dispatchDate": "2026-07-16T09:00:00.000Z",
      "expectedDeliveryDate": "2026-07-20T18:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

### 3.3 GET `/api/shipments/:shipmentId`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/shipments/:shipmentId` |
| Description | Returns a shipment by business key. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `shipmentId` |
| Request Body | None |
| Response Format | `200` with shipment object |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | `shipmentId` is required and must match the system's business key format. |
| Error Responses | Shipment not found, invalid path parameter. |

Response format:

```json
{
  "success": true,
  "data": {
    "shipmentId": "LDAD-SHP-10021",
    "currentStatus": "In Transit",
    "dispatchDate": "2026-07-16T09:00:00.000Z",
    "expectedDeliveryDate": "2026-07-20T18:00:00.000Z",
    "actualDeliveryDate": null,
    "createdBy": {
      "id": "66aa1f...",
      "fullName": "Amina Khan"
    },
    "updatedBy": {
      "id": "66aa1f...",
      "fullName": "Amina Khan"
    }
  }
}
```

---

### 3.4 PATCH `/api/shipments/:shipmentId`

| Field | Specification |
| --- | --- |
| HTTP Method | `PATCH` |
| URL | `/api/shipments/:shipmentId` |
| Description | Updates the mutable shipment fields, including status transitions. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator` |
| Request Parameters | Path: `shipmentId` |
| Request Body | Any editable shipment fields such as `currentStatus`, `expectedDeliveryDate`, `actualDeliveryDate` |
| Response Format | `200` with updated shipment |
| Status Codes | `200`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| Validation Rules | Status must be one of `Dispatched`, `In Transit`, `At Warehouse`, `Delayed`, `Delivered`; `actualDeliveryDate` is required when status becomes `Delivered`; `actualDeliveryDate` cannot precede `dispatchDate`; `expectedDeliveryDate` cannot precede `dispatchDate`. |
| Error Responses | Invalid status transition, shipment not found, duplicate business rule failure, validation failure. |

Response format:

```json
{
  "success": true,
  "data": {
    "shipmentId": "LDAD-SHP-10021",
    "currentStatus": "Delivered",
    "actualDeliveryDate": "2026-07-20T10:15:00.000Z"
  }
}
```

---

### 3.5 DELETE `/api/shipments/:shipmentId`

| Field | Specification |
| --- | --- |
| HTTP Method | `DELETE` |
| URL | `/api/shipments/:shipmentId` |
| Description | Deletes a shipment record. This should be restricted because transfers and delay reports reference shipments. |
| Authentication Required | Yes |
| User Role Access | `Manager` only |
| Request Parameters | Path: `shipmentId` |
| Request Body | None |
| Response Format | `204 No Content` |
| Status Codes | `204`, `401`, `403`, `404`, `409`, `500` |
| Validation Rules | Shipment must exist; deletion must be blocked when dependent transfer or delay records exist unless the implementation explicitly supports cascade handling. |
| Error Responses | Dependency conflict, forbidden access, shipment not found. |

---

### 3.6 GET `/api/shipments/:shipmentId/timeline`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/shipments/:shipmentId/timeline` |
| Description | Returns shipment history in chronological order, including transfers and delay events. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `shipmentId` |
| Request Body | None |
| Response Format | `200` with ordered timeline entries |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | Shipment must exist. |
| Error Responses | Shipment not found, invalid path parameter. |

Response format:

```json
{
  "success": true,
  "data": [
    {
      "type": "Shipment",
      "event": "Created",
      "timestamp": "2026-07-16T09:05:00.000Z"
    },
    {
      "type": "Transfer",
      "event": "Warehouse Transfer",
      "timestamp": "2026-07-17T12:00:00.000Z"
    },
    {
      "type": "Delay",
      "event": "Weather",
      "timestamp": "2026-07-18T07:30:00.000Z"
    }
  ]
}
```

---

## 4. Warehouse Transfers Module

Base path: `/api/transfers`

Warehouse transfer events are operational history records and should be treated as append-only.

### 4.1 POST `/api/transfers`

| Field | Specification |
| --- | --- |
| HTTP Method | `POST` |
| URL | `/api/transfers` |
| Description | Records a warehouse transfer event for a shipment. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator` |
| Request Parameters | None |
| Request Body | `shipmentId`, `fromWarehouse`, `toWarehouse`, optional `transferTimestamp` |
| Response Format | `201` with transfer record |
| Status Codes | `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| Validation Rules | Referenced shipment must exist; `fromWarehouse` and `toWarehouse` are required and must be different case-insensitively; `transferTimestamp` defaults to server time if omitted. |
| Error Responses | Shipment not found, same warehouse pair, invalid timestamp, unauthorized access. |

Request body:

```json
{
  "shipmentId": "LDAD-SHP-10021",
  "fromWarehouse": "Mumbai Hub",
  "toWarehouse": "Pune Hub",
  "transferTimestamp": "2026-07-17T12:00:00.000Z"
}
```

Response format:

```json
{
  "success": true,
  "data": {
    "id": "66ab22...",
    "shipmentId": "LDAD-SHP-10021",
    "fromWarehouse": "Mumbai Hub",
    "toWarehouse": "Pune Hub",
    "transferTimestamp": "2026-07-17T12:00:00.000Z",
    "createdBy": "66aa1f..."
  }
}
```

---

### 4.2 GET `/api/transfers`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/transfers` |
| Description | Returns a paginated list of transfer events with optional filters. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Query: `page`, `limit`, `shipmentId`, `fromWarehouse`, `toWarehouse`, `fromDate`, `toDate`, `sortOrder` |
| Request Body | None |
| Response Format | `200` with transfer array |
| Status Codes | `200`, `401`, `500` |
| Validation Rules | `shipmentId` must reference an existing shipment if supplied; dates must be valid; date range must be logical. |
| Error Responses | Invalid query, unauthorized access. |

Response format:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

---

### 4.3 GET `/api/transfers/:transferId`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/transfers/:transferId` |
| Description | Returns a single transfer event. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `transferId` |
| Request Body | None |
| Response Format | `200` with transfer record |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | `transferId` must be a valid record identifier. |
| Error Responses | Transfer not found, invalid identifier. |

---

### 4.4 GET `/api/transfers/shipment/:shipmentId`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/transfers/shipment/:shipmentId` |
| Description | Returns all transfer events for a specific shipment. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `shipmentId` |
| Request Body | None |
| Response Format | `200` with ordered transfer array |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | Shipment must exist. |
| Error Responses | Shipment not found. |

---

## 5. Delay Reports Module

Base path: `/api/delays`

Delay reports are operational history records and should be treated as append-only.

### 5.1 POST `/api/delays`

| Field | Specification |
| --- | --- |
| HTTP Method | `POST` |
| URL | `/api/delays` |
| Description | Creates a delay report for a shipment. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator` |
| Request Parameters | None |
| Request Body | `shipmentId`, `delayCategory`, `reason`, optional `delayTimestamp` |
| Response Format | `201` with delay report |
| Status Codes | `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500` |
| Validation Rules | Referenced shipment must exist; `delayCategory` must be one of the allowed categories; `reason` is required and must not be empty; `delayTimestamp` defaults to server time if omitted. |
| Error Responses | Shipment not found, invalid category, missing reason, unauthorized access. |

Request body:

```json
{
  "shipmentId": "LDAD-SHP-10021",
  "delayCategory": "Weather",
  "reason": "Heavy rainfall blocked the highway corridor.",
  "delayTimestamp": "2026-07-18T07:30:00.000Z"
}
```

Response format:

```json
{
  "success": true,
  "data": {
    "id": "66ab33...",
    "shipmentId": "LDAD-SHP-10021",
    "delayCategory": "Weather",
    "reason": "Heavy rainfall blocked the highway corridor.",
    "delayTimestamp": "2026-07-18T07:30:00.000Z",
    "reportedBy": "66aa1f..."
  }
}
```

---

### 5.2 GET `/api/delays`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/delays` |
| Description | Returns a paginated list of delay reports with optional filters. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Query: `page`, `limit`, `shipmentId`, `delayCategory`, `reportedBy`, `fromDate`, `toDate`, `sortOrder` |
| Request Body | None |
| Response Format | `200` with delay report array |
| Status Codes | `200`, `401`, `500` |
| Validation Rules | Shipment filter must reference an existing shipment if supplied; category must be valid; dates must be valid. |
| Error Responses | Invalid query, unauthorized access. |

---

### 5.3 GET `/api/delays/:delayId`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/delays/:delayId` |
| Description | Returns a single delay report. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `delayId` |
| Request Body | None |
| Response Format | `200` with delay report |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | `delayId` must be a valid record identifier. |
| Error Responses | Delay report not found, invalid identifier. |

---

### 5.4 GET `/api/delays/shipment/:shipmentId`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/delays/shipment/:shipmentId` |
| Description | Returns all delay reports for a specific shipment. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Path: `shipmentId` |
| Request Body | None |
| Response Format | `200` with ordered delay array |
| Status Codes | `200`, `401`, `404`, `500` |
| Validation Rules | Shipment must exist. |
| Error Responses | Shipment not found. |

---

## 6. Dashboard Module

Base path: `/api/dashboard`

Dashboard endpoints are read-only and return aggregates optimized for charts and KPI cards.

### 6.1 GET `/api/dashboard/overview`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/dashboard/overview` |
| Description | Returns top-level KPI values for the dashboard. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Optional query: `fromDate`, `toDate` |
| Request Body | None |
| Response Format | `200` with KPI summary |
| Status Codes | `200`, `401`, `422`, `500` |
| Validation Rules | Date filters must be valid; `fromDate` cannot exceed `toDate`. |
| Error Responses | Invalid date range, unauthorized access. |

Response format:

```json
{
  "success": true,
  "data": {
    "totalShipments": 1250,
    "delayedShipments": 86,
    "deliveredShipments": 980,
    "inTransitShipments": 144,
    "atWarehouseShipments": 20,
    "averageDeliveryTimeHours": 38.4
  }
}
```

---

### 6.2 GET `/api/dashboard/status-counts`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/dashboard/status-counts` |
| Description | Returns shipment counts grouped by current status. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Optional query: `fromDate`, `toDate` |
| Request Body | None |
| Response Format | `200` with status distribution |
| Status Codes | `200`, `401`, `422`, `500` |
| Validation Rules | Date filters must be valid when provided. |
| Error Responses | Invalid filters, unauthorized access. |

---

### 6.3 GET `/api/dashboard/delay-breakdown`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/dashboard/delay-breakdown` |
| Description | Returns delay counts by category for charting. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Optional query: `fromDate`, `toDate` |
| Request Body | None |
| Response Format | `200` with category distribution |
| Status Codes | `200`, `401`, `422`, `500` |
| Validation Rules | Date filters must be valid when provided. |
| Error Responses | Invalid filters, unauthorized access. |

Response format:

```json
{
  "success": true,
  "data": [
    { "label": "Weather", "count": 14 },
    { "label": "Vehicle Issue", "count": 9 },
    { "label": "Warehouse Delay", "count": 11 }
  ]
}
```

---

### 6.4 GET `/api/dashboard/average-delivery-time`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/dashboard/average-delivery-time` |
| Description | Returns the average delivery time for delivered shipments. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Coordinator`, `Analyst` |
| Request Parameters | Optional query: `fromDate`, `toDate` |
| Request Body | None |
| Response Format | `200` with calculated metric |
| Status Codes | `200`, `401`, `422`, `500` |
| Validation Rules | Date filters must be valid when provided. |
| Error Responses | Invalid filters, unauthorized access. |

Response format:

```json
{
  "success": true,
  "data": {
    "averageDeliveryTimeHours": 38.4,
    "sampleSize": 980
  }
}
```

---

## 7. Reports Module

Base path: `/api/reports`

The initial reporting requirement is CSV export of shipment data.

### 7.1 GET `/api/reports/shipments/export`

| Field | Specification |
| --- | --- |
| HTTP Method | `GET` |
| URL | `/api/reports/shipments/export` |
| Description | Streams shipment data as CSV for download. |
| Authentication Required | Yes |
| User Role Access | `Manager`, `Analyst` |
| Request Parameters | Query: `fromDate`, `toDate`, `status`, `search`, `sortBy`, `sortOrder` |
| Request Body | None |
| Response Format | `text/csv` stream with `Content-Disposition: attachment` |
| Status Codes | `200`, `401`, `403`, `422`, `500` |
| Validation Rules | Filters must be valid; exported set must respect role permissions; CSV headers must remain stable. |
| Error Responses | Unauthorized export request, invalid filters, export generation failure. |

Expected headers:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="ldad-shipments.csv"
```

Suggested CSV columns:

- `shipmentId`
- `currentStatus`
- `dispatchDate`
- `expectedDeliveryDate`
- `actualDeliveryDate`
- `createdAt`
- `updatedAt`

---

## 8. Canonical Validation Rules

These rules apply wherever the corresponding fields appear.

### 8.1 Shipment Status

Allowed values:

- `Dispatched`
- `In Transit`
- `At Warehouse`
- `Delayed`
- `Delivered`

Rules:

- `shipmentId` must be unique and uppercase.
- `dispatchDate` is required for create.
- `expectedDeliveryDate` cannot be earlier than `dispatchDate`.
- `actualDeliveryDate` is required when `currentStatus` becomes `Delivered`.
- `actualDeliveryDate` cannot be earlier than `dispatchDate`.

### 8.2 Delay Categories

Allowed values:

- `Weather`
- `Vehicle Issue`
- `Warehouse Delay`
- `Customs`
- `Traffic`
- `Other`

Rules:

- `reason` is always required.
- `reason` should contain operational context, not just the category name.

### 8.3 Warehouse Transfer Rules

- `fromWarehouse` and `toWarehouse` are both required.
- The two warehouse values cannot be equal when compared case-insensitively.
- `transferTimestamp` defaults to server time if omitted.

### 8.4 Date Filtering Rules

- Date query parameters must be valid ISO-8601 values.
- When both `fromDate` and `toDate` are present, `fromDate` must not exceed `toDate`.

---

## 9. Error Response Catalogue

### 9.1 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "shipmentId",
      "message": "Shipment ID is required"
    }
  ]
}
```

### 9.2 Authentication Error

```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```

### 9.3 Forbidden Error

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "errorCode": "FORBIDDEN"
}
```

### 9.4 Not Found Error

```json
{
  "success": false,
  "message": "Shipment not found",
  "errorCode": "NOT_FOUND"
}
```

### 9.5 Conflict Error

```json
{
  "success": false,
  "message": "Duplicate shipmentId",
  "errorCode": "CONFLICT"
}
```

---

## 10. Notes for Implementation

- Shipment deletion should be carefully controlled because transfer and delay records reference the shipment document.
- Database duplicate key errors such as `E11000` should be translated into a clean `409 Conflict` response.
- Update operations should run validators at the Mongoose layer.
- Operational history endpoints should be sorted by the event timestamp in descending order by default, unless a timeline view requires ascending order.

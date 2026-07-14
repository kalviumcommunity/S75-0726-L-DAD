# L-DAD Database Design

## Entity relationship diagram

```text
User (1) ── creates/updates ──< Shipment (many)
  │                                  │
  ├── creates ───────────────────────┼──< WarehouseTransfer (many)
  │                                  │
  └── reports ───────────────────────└──< DelayReport (many)

WarehouseTransfer.shipment ────────> Shipment._id
DelayReport.shipment ──────────────> Shipment._id
Shipment.createdBy / updatedBy ────> User._id
WarehouseTransfer.createdBy ───────> User._id
DelayReport.reportedBy ────────────> User._id
```

Transfers and delay reports store references rather than arrays embedded in a shipment. This keeps shipment documents small and permits an unbounded, independently queried history.

## Collections

All collections use `timestamps: true` (`createdAt`, `updatedAt`) and `versionKey: false`.

### users

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| fullName | String | Yes | — | Trimmed operator name (2–100 chars). |
| email | String | Yes | — | Lower-cased, trimmed, email-formatted login; unique index. |
| password | String | Yes | — | Password hash; excluded from query results by default and JSON output. |
| role | String enum | Yes | — | `Manager`, `Analyst`, or `Coordinator`. |
| isActive | Boolean | No | `true` | Enables soft deactivation without removing audit history. |
| createdAt / updatedAt | Date | Automatic | Current time | Mongoose audit timestamps. |

### shipments

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| shipmentId | String | Yes | — | Trimmed uppercase business identifier; unique index. |
| origin / destination | String | Yes | — | Trimmed route endpoints (max 150 chars each). |
| currentStatus | String enum | Yes | `Dispatched` | `Dispatched`, `In Transit`, `At Warehouse`, `Delayed`, or `Delivered`. |
| dispatchDate | Date | Yes | — | Start of the shipment lifecycle. |
| expectedDeliveryDate | Date | Yes | — | Must be on/after dispatch. |
| actualDeliveryDate | Date or null | No | `null` | Delivery completion date; must be on/after dispatch. |
| currentLocation | String | Yes | — | Latest known location. |
| createdBy / updatedBy | ObjectId → User | Yes | — | Accountability for creation and latest edit. |
| createdAt / updatedAt | Date | Automatic | Current time | Mongoose audit timestamps. |

Indexes: unique `shipmentId`; `{ currentStatus, expectedDeliveryDate }` for delayed/due worklists; `{ origin, destination }` for route views.

### warehousetransfers

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| shipment | ObjectId → Shipment | Yes | — | Shipment whose custody/location changes. |
| fromWarehouse / toWarehouse | String | Yes | — | Trimmed warehouse names; destination must differ from source. |
| transferTimestamp | Date | Yes | Current time | When the transfer occurred. |
| remarks | String | No | `''` | Optional operational note (max 1,000 chars). |
| createdBy | ObjectId → User | Yes | — | User who recorded the transfer. |
| createdAt / updatedAt | Date | Automatic | Current time | Mongoose audit timestamps. |

Indexes: `{ shipment, transferTimestamp: -1 }` for shipment history and `{ fromWarehouse, toWarehouse, transferTimestamp: -1 }` for route/warehouse reporting.

### delayreports

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| shipment | ObjectId → Shipment | Yes | — | Shipment affected by the delay. |
| delayReason | String | Yes | — | Human-readable explanation (3–500 chars). |
| delayCategory | String enum | Yes | — | `Weather`, `Vehicle Issue`, `Warehouse Delay`, `Customs`, `Traffic`, or `Other`. |
| delayTimestamp | Date | Yes | Current time | When the delay was observed/recorded. |
| reportedBy | ObjectId → User | Yes | — | User who submitted the report. |
| remarks | String | No | `''` | Optional supporting note (max 1,000 chars). |
| createdAt / updatedAt | Date | Automatic | Current time | Mongoose audit timestamps. |

Indexes: `{ shipment, delayTimestamp: -1 }` for history, `{ delayCategory, delayTimestamp: -1 }` for category analytics, and `{ reportedBy, delayTimestamp: -1 }` for audit views.

## Design decisions

- **User:** roles are an enum so authorization is predictable and does not depend on free-form strings. `isActive` preserves references and audit data when access is disabled. Password hashing belongs in the authentication service; the schema makes accidental exposure less likely with `select: false` and JSON removal.
- **Shipment:** its mutable current state is kept on the shipment for fast dashboards, while transfers and delays are independent event collections. This is a practical MVP balance: fast operational reads without prematurely building a full event-sourcing system. User references preserve accountability and can be populated only when a view needs names.
- **WarehouseTransfer:** transfers are separate because a shipment can have any number of them. The compound history index supports the common “latest transfers for this shipment” query and warehouse-pair reporting without embedding a growing array.
- **DelayReport:** categories are controlled values, enabling reliable filters and aggregation dashboards. `delayReason` and `remarks` retain the context that a category alone cannot express. Multiple reports per shipment are allowed, which supports recurring or distinct delay events.

## Operational notes

- MongoDB's unique indexes enforce uniqueness once indexes have been created. In production, deploy indexes before accepting traffic and handle duplicate-key error `E11000` in the API layer.
- When using `findOneAndUpdate` or `updateOne`, pass `{ runValidators: true }`; document-level cross-field date validation is most reliable with `save()`.
- The application service should set `updatedBy`, and should set `actualDeliveryDate` when a shipment becomes `Delivered`.

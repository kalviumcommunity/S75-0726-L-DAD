# L-DAD API QA Bug Report

## Summary

The implemented backend routes were reviewed through live HTTP verification and code inspection. The current runtime state shows that the API surface is partially available, but several issues block complete validation and production confidence.

## Findings

### 1. Missing transfer and delay-report route modules
- Severity: High
- Area: Server route mounting
- Evidence: Startup logs show:
  - `[server][routes] Skipping mount: ../../modules/warehouse-transfers/routes`
  - `[server][routes] Skipping mount: ../../modules/delay-reports/routes`
- Impact: The `/api/transfers` and `/api/delays` API surfaces are not currently reachable at runtime, even though the documentation and route registration logic expect them.

### 2. MongoDB connectivity failure blocks data-backed API verification
- Severity: High
- Area: Database connection
- Evidence: The backend log reports:
  - `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.`
  - `TopologyDescription: ReplicaSetNoPrimary`
- Impact: Auth, shipment, dashboard, and report endpoints that depend on database reads or writes cannot be fully exercised in the current environment.

### 3. Dashboard endpoints are not protected by authentication middleware
- Severity: Medium
- Area: Security / access control
- Evidence: `server/src/modules/dashboard/routes/dashboard.routes.js` mounts routes directly without `router.use(authenticateToken)` or role checks.
- Impact: Dashboard metrics are exposed without a bearer token, which is inconsistent with the shipment and reports routes.

### 4. Dashboard summary endpoint currently times out when Mongo is unreachable
- Severity: Medium
- Area: API reliability
- Evidence: `GET /api/dashboard/summary` returned `500 Internal Server Error` with `Operation shipments.aggregate() buffering timed out after 10000ms`.
- Impact: The dashboard summary endpoint is brittle in the absence of a healthy database connection.

### 5. Server startup currently crashes on DB connection failure in the prior build state
- Severity: Medium
- Area: Startup resilience
- Evidence: Prior to the guard change, the server exited on Mongo connection failure.
- Impact: This prevented local QA and frontend integration from starting reliably without a healthy database.

## Recommended Remediation

1. Add and mount the missing transfer and delay-report route modules.
2. Fix the database connectivity configuration or use a local Mongo service for test runs.
3. Apply `authenticateToken` and role enforcement to the dashboard routes.
4. Add graceful error handling and database health fallback for dashboard aggregation endpoints.
5. Re-run the collection in Postman once the database is reachable.

## Verification Status

- Backend health endpoint verified: `200 OK`
- Protected shipment endpoint without token verified: `401 Unauthorized`
- Dashboard summary route verified: `500 Internal Server Error` due database aggregation timeout
- Full auth and CRUD functionality remains blocked until MongoDB connectivity is restored

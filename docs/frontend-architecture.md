# L-DAD Frontend Architecture Plan

## 1. Product Intent

L-DAD is an enterprise logistics dashboard for monitoring shipments, warehouse transfers, delay reports, and operational performance. The frontend should feel calm, structured, and decision-oriented, with a strong emphasis on clarity, responsiveness, and fast navigation.

## 2. Frontend Architecture Principles

- Keep the UI modular and feature-based.
- Separate page-level logic from reusable UI components.
- Use a centralized state model for auth, user profile, filters, and shared dashboard data.
- Keep API interactions isolated behind service modules.
- Design for desktop-first enterprise use while remaining responsive for tablet and smaller screens.

---

## 3. Frontend Folder Structure

```text
client/src/
  App.tsx
  main.tsx
  index.css
  assets/
    fonts/
    icons/
    images/
  components/
    common/
      Button
      Card
      EmptyState
      Modal
      PageHeader
      SearchBar
      StatusBadge
      Table
      Tabs
      Tooltip
    layout/
      AppShell
      Sidebar
      Topbar
      Breadcrumbs
      ContentPanel
  constants/
    routes.ts
    statuses.ts
    chartColors.ts
  context/
    auth/
      AuthContext.tsx
    ui/
      ThemeContext.tsx
    dashboard/
      DashboardContext.tsx
  features/
    auth/
      components/
      pages/
      hooks/
      services/
    dashboard/
      components/
      pages/
      widgets/
      hooks/
      services/
    shipments/
      components/
      pages/
      hooks/
      services/
    warehouse-transfers/
      components/
      pages/
      hooks/
      services/
    delay-reports/
      components/
      pages/
      hooks/
      services/
    reports/
      components/
      pages/
      hooks/
      services/
    profile/
      components/
      pages/
      hooks/
      services/
  hooks/
    useDebounce.ts
    usePagination.ts
    useSearch.ts
  layouts/
    AuthLayout.tsx
    DashboardLayout.tsx
  pages/
    NotFoundPage.tsx
  routing/
    protected-routes/
      ProtectedRoute.tsx
    AppRoutes.tsx
  services/
    api/
      client.ts
      endpoints.ts
    http/
      request.ts
  styles/
    design-tokens.css
    components.css
  utils/
    date.ts
    formatters.ts
    validators.ts
```

---

## 4. Page Hierarchy

```text
App
  ├── Public Routes
  │    ├── Login
  │    └── Forgot Password (optional)
  └── Protected Routes
       ├── Dashboard
       ├── Shipments
       │    └── Shipment Details
       ├── Warehouse Transfers
       │    └── Transfer Details
       ├── Delay Reports
       │    └── Delay Report Details
       ├── Reports
       └── Profile
```

---

## 5. Component Hierarchy

```text
AppShell
  ├── Sidebar
  │    ├── Brand
  │    ├── Navigation Items
  │    └── User Section
  ├── Topbar
  │    ├── Search
  │    ├── Notifications
  │    └── User Menu
  └── ContentArea
       ├── PageHeader
       ├── FiltersBar
       ├── PageContent
       │    ├── Cards
       │    ├── Tables
       │    ├── Forms
       │    └── Charts
       └── Modal / Drawer / Toasts
```

---

## 6. Layout Structure

### Global Layout
- App shell with persistent sidebar and topbar.
- Main content area with section spacing, cards, and panels.
- Consistent header, filter bar, and action bar on each page.

### Auth Layout
- Minimal centered layout for login.
- Brand panel and authentication form only.

### Dashboard Layout
- Multi-panel layout for overview cards, charts, and activity feed.
- Right-side summary panel for alerts and recent events.

### Data Pages Layout
- Left or top filter toolbar.
- Main table or list section.
- Detail drawer or modal for selected item.

---

## 7. Navigation Flow

```text
Login → Dashboard → { Shipments | Warehouse Transfers | Delay Reports | Reports | Profile }
```

### Navigation Rules
- Default route after login: Dashboard.
- Sidebar navigation remains persistent for authenticated users.
- Deep links should preserve role-based access rules.
- User should always be able to return to dashboard quickly.

---

## 8. Protected Route Structure

### Public Routes
- /login
- /forgot-password (optional)

### Protected Routes
- /dashboard
- /shipments
- /shipments/:id
- /warehouse-transfers
- /warehouse-transfers/:id
- /delay-reports
- /delay-reports/:id
- /reports
- /profile

### Access Model
- All authenticated users can access dashboard and profile.
- Shipment, transfer, and delay pages are available for logistics operations users.
- Reports may be restricted to supervisors or admins.
- Admin-only pages can be protected by a role guard if needed.

---

## 9. Context API Structure

### AuthContext
Purpose:
- Store current user, auth token, login/logout status, and permissions.

State:
- user
- token
- isAuthenticated
- role
- permissions
- loading

### UIContext
Purpose:
- Control global UI behaviors such as sidebar state, modal visibility, and toast notifications.

State:
- sidebarOpen
- activeModal
- toasts
- theme

### DashboardContext
Purpose:
- Share dashboard-level summary and filter state across widgets.

State:
- selectedDateRange
- selectedWarehouse
- statusFilters
- summaryStats
- recentAlerts

### Optional Feature Contexts
- ShipmentContext for shipment selection and filters.
- TransferContext for transfer list state.
- ReportContext for export state and report parameters.

---

## 10. API Service Layer Structure

### api/client.ts
- Central Axios or fetch wrapper.
- Handles base URL, auth header injection, response parsing, and error normalization.

### api/endpoints.ts
- Defines endpoint constants by domain.

### http/request.ts
- Shared request helpers for get/post/put/patch/delete.

### Feature Services
Each feature has its own service file, for example:
- auth/services/auth.service.ts
- shipments/services/shipment.service.ts
- warehouse-transfers/services/transfer.service.ts
- delay-reports/services/delayReport.service.ts
- reports/services/report.service.ts

### Service Responsibilities
- Keep HTTP logic separate from view components.
- Normalize server payloads into UI-friendly structures.
- Handle loading, error, and empty-state concerns at the request layer.

---

## 11. Reusable Component Organization

### Common Components
- Button
- Card
- PageHeader
- Table
- StatusBadge
- Modal
- EmptyState
- SearchBar
- Tabs
- Tooltip

### Layout Components
- AppShell
- Sidebar
- Topbar
- ContentPanel
- Breadcrumbs

### Feature-Specific Components
- Dashboard widgets
- Shipment list and detail panels
- Transfer form and timeline components
- Delay report form and severity badges
- Report export control components
- Profile form components

---

## 12. UI Flow by Page

### A. Login
Components used:
- AuthLayout
- LoginForm
- BrandPanel
- InputField
- PasswordField
- PrimaryButton
- ErrorAlert

Data displayed:
- Email and password fields
- Error feedback and loading state

Buttons:
- Sign In
- Forgot Password

Tables:
- None

Forms:
- Login form

Charts:
- None

User interactions:
- Enter credentials
- Submit login
- Handle validation errors
- Redirect to dashboard on success

---

### B. Dashboard
Components used:
- DashboardLayout
- SummaryCard
- KPIChartCard
- StatusDistributionChart
- DelayReasonsChart
- RecentActivityList
- AlertPanel
- FilterBar

Data displayed:
- Total shipments
- Delayed shipments
- Delivered shipments
- In-transit shipment count
- Average delivery time
- Delay reasons distribution
- Recent operational alerts

Buttons:
- View all shipments
- Export summary
- Apply filters
- Refresh data

Tables:
- Recent shipments table
- Recent alerts table

Forms:
- Date range filters
- Warehouse filters

Charts:
- Bar or line chart for shipment trend
- Pie or donut chart for status distribution
- Bar chart for delay reasons

User interactions:
- Filter by date/warehouse/status
- Click a card to drill into relevant data
- Open shipment details from recent activity

---

### C. Shipments
Components used:
- PageHeader
- SearchBar
- FiltersBar
- ShipmentTable
- ShipmentStatusBadge
- ShipmentDetailDrawer
- CreateShipmentModal
- BulkActionMenu

Data displayed:
- Shipment ID
- Customer or route details
- Current status
- Origin and destination
- Warehouse location
- ETA and actual delivery date
- Assigned handler

Buttons:
- Add Shipment
- Edit Shipment
- Mark as Delivered
- Export CSV
- Filter
- View Details

Tables:
- Shipments table with sortable columns

Forms:
- Create/edit shipment form
- Status update form

Charts:
- Optional shipment progress timeline

User interactions:
- Search by ID or route
- Sort by status/date/warehouse
- Open item detail drawer
- Update shipment status
- Filter by current stage

---

### D. Warehouse Transfers
Components used:
- PageHeader
- TransferTable
- TransferTimeline
- TransferFormModal
- FilterBar
- StatusBadge

Data displayed:
- Transfer ID
- Source warehouse
- Destination warehouse
- Item count or shipment count
- Transfer status
- Transfer timestamp
- Handler and comments

Buttons:
- New Transfer
- Update Transfer
- View Timeline
- Export Summary

Tables:
- Transfer records table

Forms:
- Transfer creation/update form

Charts:
- Optional transfer volume chart over time

User interactions:
- Create a transfer record
- Update transfer progress
- Review transfer history by shipment or warehouse

---

### E. Delay Reports
Components used:
- PageHeader
- DelayReportsTable
- DelaySeverityBadge
- DelayReportDetailPanel
- DelayFormModal
- FilterBar

Data displayed:
- Shipment ID
- Reported delay reason
- Severity level
- Reported time
- Responsible team
- Status of resolution
- Notes/comments

Buttons:
- Add Delay Report
- Resolve Report
- Escalate
- Export

Tables:
- Delay reports table

Forms:
- Delay report form
- Resolution/update form

Charts:
- Delay reason frequency chart
- Severity trend chart

User interactions:
- Add new delay issue
- Update resolution status
- Filter by severity and warehouse
- Open detailed case history

---

### F. Reports
Components used:
- ReportsPageHeader
- ReportFilterPanel
- ExportControls
- ReportPreviewCard
- TablePreview
- ChartPreview
- DateRangePicker

Data displayed:
- Shipment summary data
- Delay trend data
- Warehouse transfer summary
- Export-ready report tables and visuals

Buttons:
- Generate Report
- Export CSV
- Export PDF
- Share Report

Tables:
- Report summary table

Forms:
- Report parameter form

Charts:
- Trend line chart
- Delay breakdown chart
- Warehouse performance chart

User interactions:
- Choose date range and report type
- Preview report before exporting
- Trigger export actions

---

### G. Profile
Components used:
- ProfileCard
- ProfileForm
- AvatarUploadPanel
- PreferencesPanel
- SecuritySettingsCard

Data displayed:
- Full name
- Email
- Role and department
- Notification preferences
- Password/security settings

Buttons:
- Edit Profile
- Save Changes
- Change Password
- Upload Avatar

Tables:
- None

Forms:
- Profile details form
- Password change form
- Preferences form

Charts:
- None

User interactions:
- Update account information
- Modify notification preferences
- Change password
- Manage account settings

---

## 13. Recommended UX Direction

- Use a muted enterprise palette with strong contrast for status indicators.
- Favor card-based summaries, clean tables, and minimal visual noise.
- Use status badges consistently for delayed, in transit, delivered, and transferred items.
- Keep primary actions obvious and close to the relevant content.
- Use dense but readable tables for operations teams.
- Provide quick filters and search at the top of each data page.

---

## 14. Suggested Interaction Patterns

- Table row click opens details in a drawer.
- Primary actions appear in a sticky action bar on larger screens.
- Modals are used for create/edit forms.
- Toasts are used for save, update, and export feedback.
- Empty states guide users when no records exist.

---

## 15. Final Recommendation

The frontend should be organized around a stable app shell, feature-based folders, and a layered data architecture that keeps UI components clean and maintainable. This structure will support growth, role-based access, and future reporting enhancements without making the codebase difficult to scale.

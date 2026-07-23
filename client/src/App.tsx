import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/auth/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import AuditLogsPage from './features/audit-logs/pages/AuditLogsPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import DelayReportsPage from './features/delay-reports/pages/DelayReportsPage';
import NotFoundPage from './features/not-found/pages/NotFoundPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import ReportsPage from './features/reports/pages/ReportsPage';
import ShipmentsPage from './features/shipments/pages/ShipmentsPage';
import ShipmentTimelinePage from './features/shipments/pages/ShipmentTimelinePage';
import WarehouseTransfersPage from './features/warehouse-transfers/pages/WarehouseTransfersPage';
import ProtectedRoute from './routing/protected-routes/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/shipments/:id/timeline" element={<ShipmentTimelinePage />} />
            <Route path="/warehouse-transfers" element={<WarehouseTransfersPage />} />
            <Route path="/delay-reports" element={<DelayReportsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

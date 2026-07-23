import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import Loader from '../../components/common/Loader';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;

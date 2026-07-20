import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/shipments': 'Shipments',
  '/warehouse-transfers': 'Warehouse Transfers',
  '/delay-reports': 'Delay Reports',
  '/reports': 'Reports',
  '/profile': 'Profile'
};

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const title = pageTitles[location.pathname] ?? 'L-DAD';

  return (
    <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Operations Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 sm:block">
          <span className="font-semibold text-slate-900">{user?.fullName ?? 'User'}</span> • {user?.role ?? 'Guest'}
        </div>
        <button
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;

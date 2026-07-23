import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/auth/AuthContext';

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: ReactNode;
};

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Shipments', path: '/shipments' },
  { label: 'Warehouse Transfers', path: '/warehouse-transfers' },
  { label: 'Delay Reports', path: '/delay-reports' },
  { label: 'Reports', path: '/reports' },
  { label: 'Audit Logs', path: '/audit-logs' },
  { label: 'User Management', path: '/users' },
  { label: 'Settings', path: '/profile' }
];

const Sidebar = ({ isOpen = false, onClose, trigger }: SidebarProps) => {
  const { user } = useAuth();
  const visibleNavItems = navItems.filter((item) => {
    if (item.path === '/audit-logs') return ['Manager', 'Analyst'].includes(user?.role || '');
    if (item.path === '/users') return user?.role === 'Manager';
    return true;
  });

  return (
    <>
      {trigger}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform flex-col rounded-r-[32px] border border-slate-200 bg-white p-5 shadow-soft transition-transform duration-300 lg:static lg:z-auto lg:flex lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">L-DAD</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Logistics Control Center</h1>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <nav className="space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-[24px] bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System state</p>
          <p className="mt-2 font-semibold text-slate-900">Operational</p>
          <p className="mt-1">All live dashboards are ready.</p>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={onClose} />}
    </>
  );
};

export default Sidebar;

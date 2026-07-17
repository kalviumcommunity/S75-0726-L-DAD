import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Shipments', path: '/shipments' },
  { label: 'Warehouse Transfers', path: '/warehouse-transfers' },
  { label: 'Delay Reports', path: '/delay-reports' },
  { label: 'Reports', path: '/reports' },
  { label: 'Profile', path: '/profile' }
];

const Sidebar = () => {
  return (
    <aside className="hidden w-72 flex-col rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm lg:flex">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">L-DAD</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Logistics Control Center</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
  );
};

export default Sidebar;

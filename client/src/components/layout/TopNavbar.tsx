import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { searchApi } from '../../services/api/search.service';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/shipments': 'Shipments',
  '/warehouse-transfers': 'Warehouse Transfers',
  '/delay-reports': 'Delay Reports',
  '/reports': 'Reports',
  '/audit-logs': 'Audit Logs',
  '/profile': 'Settings'
};

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ shipments: any[]; transfers: any[]; delayReports: any[] }>({ shipments: [], transfers: [], delayReports: [] });

  const title = pageTitles[location.pathname] ?? 'L-DAD';

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults({ shipments: [], transfers: [], delayReports: [] });
        return;
      }

      try {
        const data = await searchApi.globalSearch(query.trim());
        setResults(data);
      } catch {
        setResults({ shipments: [], transfers: [], delayReports: [] });
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Operations Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="Search shipments, transfers, delays"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {query.trim() && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              {results.shipments.length === 0 && results.transfers.length === 0 && results.delayReports.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">No matches found.</p>
              ) : (
                <div className="space-y-1">
                  {results.shipments.slice(0, 2).map((item) => (
                    <button key={item.id} onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <span className="text-xs uppercase text-slate-500">Shipment</span>
                    </button>
                  ))}
                  {results.transfers.slice(0, 2).map((item) => (
                    <button key={item.id} onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <span className="text-xs uppercase text-slate-500">Transfer</span>
                    </button>
                  ))}
                  {results.delayReports.slice(0, 2).map((item) => (
                    <button key={item.id} onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <span className="text-xs uppercase text-slate-500">Delay</span>
                    </button>
                  ))}
                  <button onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)} className="mt-1 w-full rounded-xl bg-slate-900 px-3 py-2 text-left text-sm font-medium text-white">
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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

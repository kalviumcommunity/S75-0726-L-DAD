import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarTrigger = (
    <button
      onClick={() => setSidebarOpen(true)}
      className="fixed bottom-6 left-6 z-40 rounded-full bg-slate-900 p-3 text-white shadow-lg lg:hidden"
      aria-label="Open menu"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} trigger={sidebarTrigger} />
        <div className="flex-1">
          <TopNavbar />
          <main className="mt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

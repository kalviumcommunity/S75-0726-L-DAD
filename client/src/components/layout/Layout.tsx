import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Sidebar />
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

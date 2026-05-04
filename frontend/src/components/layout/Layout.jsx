import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <Navbar />
    <main className="ml-60 pt-16 min-h-screen">
      <div className="p-6">
        <Outlet />
      </div>
    </main>
  </div>
);

export default Layout;

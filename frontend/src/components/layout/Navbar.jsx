import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const pageTitles = {
  '/dashboard':  'Dashboard',
  '/users':      'Users',
  '/students':   'Students',
  '/teachers':   'Teachers',
  '/groups':     'Groups',
  '/faculties':  'Faculties',
  '/subjects':   'Subjects',
  '/schedules':  'Schedules',
  '/attendance': 'Attendance',
  '/grades':     'Grades',
};

const Navbar = () => {
  const { user } = useSelector((s) => s.auth);
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'HEMIS';

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':          'Dashboard',
  '/users':              'Foydalanuvchilar',
  '/students':           'Talabalar',
  '/teachers':           "O'qituvchilar",
  '/groups':             'Guruhlar',
  '/faculties':          'Fakultetlar',
  '/subjects':           'Fanlar',
  '/schedules':          'Dars jadvali',
  '/attendance':         'Davomat',
  '/grades':             'Baholar',
  '/profile':            'Profil',
  '/student/dashboard':  'Bosh sahifa',
  '/student/grades':     'Baholarim',
  '/student/attendance': 'Davomatim',
  '/student/schedule':   'Dars jadvali',
  '/teacher/dashboard':  'Bosh sahifa',
  '/teacher/attendance': 'Davomat belgilash',
};

const ROLE_LABEL = { admin: 'Administrator', teacher: "O'qituvchi", student: 'Talaba' };

const Navbar = () => {
  const { user }     = useSelector((s) => s.auth);
  const { pathname } = useLocation();
  const title        = PAGE_TITLES[pathname] || 'HEMIS';

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <Link
        to="/profile"
        className="flex items-center gap-2 pl-3 border-l border-gray-200 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900 leading-none">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABEL[user?.role] || user?.role}</p>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;

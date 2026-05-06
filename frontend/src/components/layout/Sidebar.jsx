import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Users2,
  Building2, BookMarked, Calendar, ClipboardCheck, Award,
  LogOut, UserCircle, ClipboardList,
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';

const NAV = {
  admin: [
    { path: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
    { path: '/users',      label: 'Foydalanuvchilar',   icon: Users },
    { path: '/students',   label: 'Talabalar',           icon: GraduationCap },
    { path: '/teachers',   label: "O'qituvchilar",       icon: BookOpen },
    { path: '/groups',     label: 'Guruhlar',            icon: Users2 },
    { path: '/faculties',  label: 'Fakultetlar',         icon: Building2 },
    { path: '/subjects',   label: 'Fanlar',              icon: BookMarked },
    { path: '/schedules',  label: 'Jadval',              icon: Calendar },
    { path: '/attendance', label: 'Davomat',             icon: ClipboardCheck },
    { path: '/grades',     label: 'Baholar',             icon: Award },
  ],
  teacher: [
    { path: '/teacher/dashboard',  label: 'Bosh sahifa',       icon: LayoutDashboard },
    { path: '/teacher/attendance', label: 'Davomat belgilash', icon: ClipboardCheck },
    { path: '/subjects',           label: 'Fanlarim',           icon: BookMarked },
    { path: '/students',           label: 'Talabalar',          icon: GraduationCap },
    { path: '/schedules',          label: 'Jadval',             icon: Calendar },
    { path: '/grades',             label: 'Baholar',            icon: Award },
  ],
  student: [
    { path: '/student/dashboard',  label: 'Bosh sahifa',  icon: LayoutDashboard },
    { path: '/student/schedule',   label: 'Dars jadvali', icon: Calendar },
    { path: '/student/grades',     label: 'Baholarim',    icon: Award },
    { path: '/student/attendance', label: 'Davomatim',    icon: ClipboardList },
  ],
};

const ROLE_LABEL = { admin: 'Administrator', teacher: "O'qituvchi", student: 'Talaba' };

const Sidebar = () => {
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const navItems  = NAV[user?.role] || [];

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">HEMIS</p>
            <p className="text-slate-400 text-xs mt-0.5">University System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profil + Chiqish */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-0.5">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400">{ROLE_LABEL[user?.role] || user?.role}</p>
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
          }
        >
          <UserCircle size={18} />
          <span>Profil</span>
        </NavLink>
        <button
          onClick={() => dispatch(logoutUser())}
          className="sidebar-link sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut size={18} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

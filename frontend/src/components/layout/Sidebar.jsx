import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Users2,
  Building2, BookMarked, Calendar, ClipboardCheck, Award, LogOut,
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const allNavItems = [
  { path: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard,  roles: ['admin', 'teacher', 'student'] },
  { path: '/users',      label: 'Users',       icon: Users,            roles: ['admin'] },
  { path: '/students',   label: 'Students',    icon: GraduationCap,    roles: ['admin', 'teacher'] },
  { path: '/teachers',   label: 'Teachers',    icon: BookOpen,         roles: ['admin'] },
  { path: '/groups',     label: 'Groups',      icon: Users2,           roles: ['admin', 'teacher'] },
  { path: '/faculties',  label: 'Faculties',   icon: Building2,        roles: ['admin'] },
  { path: '/subjects',   label: 'Subjects',    icon: BookMarked,       roles: ['admin', 'teacher'] },
  { path: '/schedules',  label: 'Schedules',   icon: Calendar,         roles: ['admin', 'teacher', 'student'] },
  { path: '/attendance', label: 'Attendance',  icon: ClipboardCheck,  roles: ['admin', 'teacher', 'student'] },
  { path: '/grades',     label: 'Grades',      icon: Award,            roles: ['admin', 'teacher', 'student'] },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const navItems = allNavItems.filter((i) => i.roles.includes(user?.role));

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

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-white truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="sidebar-link sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

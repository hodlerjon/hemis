import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GraduationCap, BookOpen, Users2, BookMarked, TrendingUp, Clock } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {loading ? (
        <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

const QuickCard = ({ title, desc, icon: Icon, color, link }) => (
  <Link to={link} className="card p-5 hover:shadow-md transition-shadow group block">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} />
    </div>
    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</p>
    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
  </Link>
);

const Dashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState({ students: 0, teachers: 0, groups: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, t, g, sub] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/teachers?limit=1'),
          api.get('/groups?limit=1'),
          api.get('/subjects?limit=1'),
        ]);
        setStats({
          students: s.data.total ?? 0,
          teachers: t.data.total ?? 0,
          groups: g.data.total ?? 0,
          subjects: sub.data.total ?? 0,
        });
      } catch (_) {
        // stats are non-critical
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin' || user?.role === 'teacher') fetchStats();
    else setLoading(false);
  }, [user?.role]);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-1">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-blue-200 text-sm mt-1 capitalize">{user?.role} · HEMIS University</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <GraduationCap size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats (admin/teacher only) */}
      {(isAdmin || user?.role === 'teacher') && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={stats.students} icon={GraduationCap} color="bg-blue-500" loading={loading} />
            <StatCard label="Total Teachers" value={stats.teachers} icon={BookOpen} color="bg-emerald-500" loading={loading} />
            <StatCard label="Academic Groups" value={stats.groups} icon={Users2} color="bg-violet-500" loading={loading} />
            <StatCard label="Subjects" value={stats.subjects} icon={BookMarked} color="bg-amber-500" loading={loading} />
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role !== 'student' && (
            <QuickCard
              title="Mark Attendance"
              desc="Record today's class attendance"
              icon={TrendingUp}
              color="bg-green-50 text-green-700"
              link="/attendance"
            />
          )}
          <QuickCard
            title="View Schedule"
            desc="Check your upcoming classes"
            icon={Clock}
            color="bg-blue-50 text-blue-700"
            link="/schedules"
          />
          <QuickCard
            title="Grades"
            desc={user?.role === 'student' ? 'View your academic performance' : 'Enter and manage grades'}
            icon={BookMarked}
            color="bg-purple-50 text-purple-700"
            link="/grades"
          />
        </div>
      </div>

      {/* Info footer */}
      <div className="card p-4 flex items-center gap-3 text-sm text-gray-500">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        System is running normally ·{' '}
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>
    </div>
  );
};

export default Dashboard;

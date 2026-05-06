import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { GraduationCap, Calendar, ClipboardCheck, Award, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { fetchUserProfile } from '../../features/auth/authSlice';

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((s) => s.auth);
  const [grades, setGrades]       = useState([]);
  const [attendance, setAttend]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!profile) dispatch(fetchUserProfile());
  }, [profile, dispatch]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [g, a] = await Promise.all([
          api.get(`/grades/student/${user._id}?limit=5`),
          api.get(`/attendance/student/${user._id}`),
        ]);
        setGrades(g.data.data || []);
        setAttend(a.data);
      } catch (_) {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const gpa          = attendance?.gpa ?? grades.reduce((s, g) => s + (g.total || 0), 0) / (grades.length || 1);
  const presentCount = attendance?.summary?.present ?? 0;
  const totalCount   = (attendance?.summary?.present ?? 0) + (attendance?.summary?.absent ?? 0) +
                       (attendance?.summary?.late ?? 0) + (attendance?.summary?.excused ?? 0);
  const attendPct    = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Xush kelibsiz,</p>
            <h2 className="text-2xl font-bold mt-1">{user?.firstName} {user?.lastName}</h2>
            <p className="text-blue-200 text-sm mt-1">
              {profile?.group?.name || 'Guruh yuklanmoqda...'} · {profile?.faculty?.name || ''}
            </p>
          </div>
          <div className="hidden sm:block w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <GraduationCap size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="GPA (o'rtacha ball)" value={Number(gpa || 0).toFixed(1)}
          icon={TrendingUp} color="bg-blue-500" sub="Joriy semestr" />
        <StatCard label="Davomat" value={`${attendPct}%`}
          icon={ClipboardCheck} color="bg-emerald-500"
          sub={`${presentCount} / ${totalCount} dars`} />
        <StatCard label="Fanlar soni" value={grades.length}
          icon={Award} color="bg-violet-500" sub="Baholangan fanlar" />
      </div>

      {/* So'nggi baholar */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">So'nggi baholar</h3>
          <Link to="/student/grades" className="text-sm text-blue-600 hover:underline">Barchasini ko'rish</Link>
        </div>
        {grades.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Hali baho yo'q</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {grades.slice(0, 5).map((g) => (
              <div key={g._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {g.subject?.name || '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    JN: {g.midterm ?? '—'} · ON: {g.final ?? '—'} · YN: {g.exam ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    g.letterGrade === 'A' ? 'bg-green-100 text-green-700' :
                    g.letterGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                    g.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                    g.letterGrade === 'D' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{g.letterGrade || '—'}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{g.total ?? '—'} ball</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tezkor havolalar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/student/schedule" className="card p-5 hover:shadow-md transition-shadow group block">
          <Calendar size={20} className="text-blue-600 mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-blue-600">Dars jadvali</p>
          <p className="text-sm text-gray-500 mt-0.5">Haftalik jadvalimni ko'rish</p>
        </Link>
        <Link to="/student/attendance" className="card p-5 hover:shadow-md transition-shadow group block">
          <ClipboardCheck size={20} className="text-emerald-600 mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-blue-600">Davomatim</p>
          <p className="text-sm text-gray-500 mt-0.5">Qoldirgan darslarimni ko'rish</p>
        </Link>
        <Link to="/student/grades" className="card p-5 hover:shadow-md transition-shadow group block">
          <Award size={20} className="text-violet-600 mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-blue-600">Baholarim</p>
          <p className="text-sm text-gray-500 mt-0.5">Fan bo'yicha natijalarim</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
